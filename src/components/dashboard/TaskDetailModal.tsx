import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // For description
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For status & priority
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Task } from '@/services/api/tasksApi'; // Assuming Task type is exported
import { Loader2 } from 'lucide-react';

// Define Zod schema for task validation
const taskFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100, { message: "Title must be 100 characters or less." }),
  description: z.string().max(500, { message: "Description must be 500 characters or less." }).optional().or(z.literal('')), // Optional, allow empty string
  due_date: z.string().optional().or(z.literal('')), // Optional, allow empty string. Could also use z.date() if a date picker is used.
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["No Status", "To Do", "Doing", "Done"]),
  category: z.string().max(50, { message: "Category must be 50 characters or less." }).optional().or(z.literal('')),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskDetailModalProps {
  task: Partial<Task> | null; // Allow partial task for new tasks
  open: boolean;
  onClose: () => void;
  onSave: (data: TaskFormValues, taskId?: string) => Promise<void>; // Make onSave async
  onDelete?: (taskId: string) => Promise<void>; // Make onDelete async
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, open, onClose, onSave, onDelete }) => {
  const isNewTask = !task?.task_id || task.task_id === 'new';
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      status: 'To Do',
      category: '',
    },
  });

  useEffect(() => {
    if (task && open) {
      form.reset({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '', // Format for date input
        priority: task.priority || 'medium',
        status: task.status || 'To Do',
        category: task.category || '',
      });
    }
  }, [task, open, form]);

  const handleFormSubmit = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(values, task?.task_id && task.task_id !== 'new' ? task.task_id : undefined);
      // onClose(); // Let parent handle close on successful save
    } catch (error) {
      // Error handling can be done in the parent or here with a local error state
      console.error("Failed to save task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete && task?.task_id && task.task_id !== 'new') {
      setIsDeleting(true);
      try {
        await onDelete(task.task_id);
        // onClose(); // Let parent handle close
      } catch (error) {
        console.error("Failed to delete task:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-lg glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair title-gradient">
            {isNewTask ? 'Add New Task' : 'Edit Task Details'}
          </DialogTitle>
          <DialogDescription>
            {isNewTask ? 'Fill in the details to create a new task.' : 'Update the details for your task.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-wedding-brown">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Book photographer" {...field} className="glass-card border-wedding-gold/30" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-wedding-brown">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add more details about the task..." {...field} className="glass-card border-wedding-gold/30 min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-wedding-brown">Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="glass-card border-wedding-gold/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-wedding-brown">Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-card border-wedding-gold/30">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-wedding-brown">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-card border-wedding-gold/30">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="No Status">No Status</SelectItem>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="Doing">Doing</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-wedding-brown">Category (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Venue, Catering" {...field} className="glass-card border-wedding-gold/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              {!isNewTask && onDelete && (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting} className="mr-auto">
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="nav-link">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="cta-button" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isNewTask ? 'Add Task' : 'Save Changes')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
