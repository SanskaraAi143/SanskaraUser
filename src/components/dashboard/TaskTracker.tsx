
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar, Edit, Trash2, X, Check, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { getTasks, createTask, updateTask, deleteTask, Task } from '@/services/api/taskApi';

const TaskTracker = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load your tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim() === '') return;
    
    try {
      const task: Omit<Task, 'id'> = {
        title: newTask,
        completed: false,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
        priority: 'medium',
      };
      
      const createdTask = await createTask(task);
      setTasks(prev => [...prev, createdTask]);
      setNewTask('');
      
      toast({
        title: "Task added",
        description: "New task has been added to your list.",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleToggleComplete = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const updatedTask = { ...task, completed: !task.completed };
      await updateTask(updatedTask);
      
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.title);
  };
  
  const handleSaveEdit = async () => {
    if (editingTaskText.trim() === '' || !editingTaskId) return;
    
    try {
      const task = tasks.find(t => t.id === editingTaskId);
      if (!task) return;
      
      const updatedTask = { ...task, title: editingTaskText };
      await updateTask(updatedTask);
      
      setTasks(prev => prev.map(task => 
        task.id === editingTaskId ? { ...task, title: editingTaskText } : task
      ));
      
      setEditingTaskId(null);
      setEditingTaskText('');
      
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskText('');
  };
  
  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      
      toast({
        title: "Task deleted",
        description: "The task has been removed from your list.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Filter tasks
  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-wedding-red animate-spin" />
        <span className="ml-2 text-lg text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Wedding Tasks</CardTitle>
            <CardDescription>Track your wedding preparation tasks</CardDescription>
          </div>
          <div className="text-sm text-gray-500">
            {completedTasks.length}/{tasks.length} completed
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                className="flex-1"
              />
              <Button onClick={handleAddTask}>
                <Plus size={16} className="mr-1" />
                Add
              </Button>
            </div>
            
            <div className="space-y-1">
              {incompleteTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-center justify-between p-3 rounded-md hover:bg-gray-50 border-l-4 ${
                    task.priority === 'high' ? 'border-red-500' :
                    task.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
                  }`}
                >
                  {editingTaskId === task.id ? (
                    <div className="flex flex-1 space-x-2">
                      <Input
                        value={editingTaskText}
                        onChange={(e) => setEditingTaskText(e.target.value)}
                        autoFocus
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
                        <Check size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task.id)}
                          className="text-wedding-red"
                        />
                        <span className="text-sm font-medium">{task.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {task.dueDate}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => handleStartEdit(task)}>
                          <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            
            {completedTasks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Completed</h3>
                <div className="space-y-1">
                  {completedTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 bg-gray-50/50"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task.id)}
                          className="text-wedding-red"
                        />
                        <span className="text-sm font-medium text-gray-500 line-through">{task.title}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTracker;
