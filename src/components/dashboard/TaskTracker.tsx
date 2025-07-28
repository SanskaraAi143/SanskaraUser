import React, { useState, useEffect } from 'react';
import TaskDetailModal, { TaskFormValues } from './TaskDetailModal'; // Import TaskFormValues
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/context/AuthContext';
import { getUserTasks, addUserTask, updateUserTask, removeUserTask } from '@/services/api/tasksApi';
// TaskRow seems unused in this Kanban view, so removing import for now to avoid confusion.
// import TaskRow from './TaskRow';
import Pagination from './Pagination';
import CategoryManager from './CategoryManager';
import { CalendarDays, PlusCircle } from 'lucide-react'; // Added PlusCircle for Add button

import type { Task } from '@/services/api/tasksApi';
import { getPriorityColor } from '@/lib/utils'; // Assuming this utility exists and works

const TaskTracker = () => {
  const { user } = useAuth();
  const [modalTask, setModalTask] = useState<Partial<Task> | null>(null); // Use Partial<Task> for new task object
  const [loading, setLoading] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(() => JSON.parse(localStorage.getItem('categories') || '[]'));

  // Filtering, sorting, and search state - Initialized from localStorage via userPrefs
  const [userPrefs, setUserPrefs] = useState(() => {
    const savedPrefs = localStorage.getItem('userPrefs');
    return savedPrefs ? JSON.parse(savedPrefs) : {
      filterStatus: 'all',
      filterPriority: 'all',
      filterCategory: 'all',
      sortBy: 'due_date',
      sortOrder: 'asc',
      search: '',
    };
  });

  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>(userPrefs.filterStatus);
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>(userPrefs.filterPriority);
  const [filterCategory, setFilterCategory] = useState(userPrefs.filterCategory);
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at'>(userPrefs.sortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(userPrefs.sortOrder);
  const [search, setSearch] = useState(userPrefs.search);

  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(() => Number(localStorage.getItem('tasksPerPage')) || 10); // Increased default

  // Unused state related to a direct form or undo/redo - can be removed or completed later
  // const [title, setTitle] = useState("");
  // const [description, setDescription] = useState("");
  // const [dueDate, setDueDate] = useState("");
  // const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  // const [category, setCategory] = useState("");
  // const [undoStack, setUndoStack] = useState<any[]>([]);
  // const [redoStack, setRedoStack] = useState<any[]>([]);
  // const [showUndo, setShowUndo] = useState(false);
  // const [undoAction, setUndoAction] = useState<null | (() => void)>(null);


  // Load tasks from Supabase on mount
  useEffect(() => {
    if (!user?.wedding_id) {
      setLoading(false); // Stop loading if no user
      setTasks([]); // Clear tasks if no user
      return;
    }
    setLoading(true);
    getUserTasks(user.wedding_id)
      .then(setTasks)
      .catch(err => {
        console.error("Failed to load tasks:", err);
        setError("Could not load your tasks. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [user?.wedding_id]);

  // Persist user preferences
  useEffect(() => {
    localStorage.setItem('userPrefs', JSON.stringify({ filterStatus, filterPriority, filterCategory, sortBy, sortOrder, search }));
  }, [filterStatus, filterPriority, filterCategory, sortBy, sortOrder, search]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('tasksPerPage', String(tasksPerPage));
  }, [tasksPerPage]);

  // Commenting out unused inline edit handler - modal is primary edit method now
  // const handleEditTask = async (taskId: string, updates: Partial<Task>) => { ... };

  const handleModalSave = async (data: TaskFormValues, taskId?: string) => {
    if (!user?.wedding_id) {
      setError('User not authenticated. Please log in again.');
      setModalTask(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const taskDataPayload: Partial<Task> = {
        title: data.title,
        description: data.description || null,
        due_date: data.due_date || null,
        priority: data.priority,
        status: data.status,
        category: data.category || null,
        is_complete: data.status === 'Done',
      };

      if (taskId && taskId !== 'new') {
        await updateUserTask(taskId, taskDataPayload);
      } else {
        await addUserTask(
          user.wedding_id,
          taskDataPayload.title!,
          taskDataPayload.description,
          taskDataPayload.due_date,
          taskDataPayload.priority!,
          taskDataPayload.category,
          taskDataPayload.status!,
          taskDataPayload.is_complete
        );
      }
      setTasks(await getUserTasks(user.wedding_id));
      setModalTask(null);
    } catch (err: unknown) {
      console.error("Failed to save task:", err);
      const errorMessage = (err as Error).message || 'Failed to save task. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewTaskModal = () => {
    setModalTask({ task_id: 'new' }); // task_id 'new' signifies a new task for the modal
  };

  const handleToggleComplete = async (task: Task) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      // If current status is 'Done', toggling means moving it to 'To Do' (or 'No Status' if preferred)
      // If not 'Done', toggling means moving it to 'Done'
      const newStatus = task.status === 'Done' ? 'To Do' : 'Done';
      await updateUserTask(task.task_id, {
        is_complete: newStatus === 'Done',
        status: newStatus
      });
      setTasks(await getUserTasks(user.wedding_id));
    } catch (err: unknown) {
      console.error("Failed to update task completion:", err);
      setError((err as Error).message || "Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user?.wedding_id) return;
    setLoading(true);
    setError(null);
    try {
      await removeUserTask(taskId);
      setTasks(await getUserTasks(user.wedding_id));
      setModalTask(null); // Close modal if delete was initiated from there
    } catch (err: unknown) {
      console.error("Failed to delete task:", err);
      setError((err as Error).message || "Failed to delete task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }

    const taskToUpdate = tasks.find(t => t.task_id === draggableId);
    if (!taskToUpdate) return;

    const newStatus = destination.droppableId as Task['status'];
    const newIsComplete = newStatus === 'Done';

    // Optimistic UI update
    const updatedTasks = tasks.map(t =>
      t.task_id === draggableId ? { ...t, status: newStatus, is_complete: newIsComplete } : t
    );
    // Reorder tasks within the new column
    // This part is complex if strict ordering is needed within columns based on drag.
    // For now, just updating status. A full reordering might involve splicing and inserting.
    setTasks(updatedTasks);

    updateUserTask(taskToUpdate.task_id, { status: newStatus, is_complete: newIsComplete })
      .catch(async () => {
        setError('Failed to update task status. Reverting.');
        // Revert to previous state on error
        setTasks(await getUserTasks(user.wedding_id));
      });
  }

  const kanbanStatuses: Array<Task['status']> = ["No Status", "To Do", "Doing", "Done"];
  
  useEffect(() => {
    if (error) {
      // Basic error display, can be replaced with toast
      console.error("TaskTracker Error:", error);
      // Clear error after some time
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Filtered and Sorted Tasks for display
  const processedTasks = tasks
    .filter(task => {
      // Filter by completion status
      if (filterStatus === 'complete' && !task.is_complete) return false;
      if (filterStatus === 'incomplete' && task.is_complete) return false;

      // Filter by priority
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

      // Filter by category
      if (filterCategory !== 'all' && task.category !== filterCategory) return false;

      // Filter by search term
      if (search !== '' &&
          !(task.title.toLowerCase().includes(search.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(search.toLowerCase()))))
        return false;

      // Filter by lead_party based on user role
      if (user?.role) {
        const userRole = user.role.toLowerCase();
        const taskLeadParty = (task.lead_party || '').toLowerCase();

        if (taskLeadParty === 'shared' || taskLeadParty === 'couple') {
          return true; // Shared tasks are visible to all members of the couple
        } else if (userRole.includes('bride') && taskLeadParty.includes('bride')) {
          return true;
        } else if (userRole.includes('groom') && taskLeadParty.includes('groom')) {
          return true;
        } else if (userRole.includes('planner')) {
          return true; // Planners can see all tasks
        } else if (taskLeadParty === '') {
          return true; // Tasks with no lead party are visible to all
        }
        return false; // Hide if not shared, not matching role, and not a planner
      }

      return true; // If no user role, show all tasks (or implement default visibility)
    });

  return (
    <div className="space-y-6 p-1"> {/* Added p-1 for slight breathing room */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {/* Header with Actions */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold title-gradient mb-1 sm:mb-2">
              Wedding Tasks
            </h2>
            <p className="text-sm text-wedding-brown/80">
              Organize your wedding preparations with this Kanban board.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
            <Button className="cta-button px-4 py-2 text-sm" onClick={handleOpenNewTaskModal}>
              <PlusCircle size={18} className="mr-2" />
              Add New Task
            </Button>
            <CategoryManager
              categories={categories}
              onAdd={cat => setCategories(prev => [...prev, cat])}
              onDelete={cat => setCategories(prev => prev.filter(c => c !== cat))}
            />
          </div>
        </div>
      </div>

      {/* TODO: Add Filter controls component here (search, filter by status/priority/category, sort by) */}

      {loading && <div className="text-center py-10 text-wedding-brown">Loading tasks...</div>}

      {!loading && tasks.length === 0 && (
        <div className="text-center py-10 glass-card p-6">
          <h3 className="text-xl font-semibold text-wedding-brown mb-2">No tasks yet!</h3>
          <p className="text-wedding-brown/80 mb-4">Click "Add New Task" to start planning.</p>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {kanbanStatuses.map((statusValue) => (
              <Droppable key={statusValue} droppableId={statusValue}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`rounded-xl p-3 sm:p-4 min-h-[200px] transition-colors duration-200 border
                      ${snapshot.isDraggingOver ? 'bg-wedding-gold/20 border-wedding-gold' : 'bg-wedding-cream/50 border-wedding-cream'}
                    `}
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="font-semibold text-lg text-wedding-brown">
                        {statusValue}
                      </h3>
                      <span className="bg-wedding-gold/20 text-wedding-orange text-xs font-semibold px-2 py-0.5 rounded-full">
                        {processedTasks.filter((task) => task.status === statusValue).length}
                      </span>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {processedTasks
                        .filter((task) => task.status === statusValue)
                        .map((task, index) => (
                          <Draggable
                            key={task.task_id}
                            draggableId={task.task_id}
                            index={index}
                          >
                            {(providedDraggable, snapshotDraggable) => (
                              <div
                                ref={providedDraggable.innerRef}
                                {...providedDraggable.draggableProps}
                                {...providedDraggable.dragHandleProps}
                                className={`glass-card p-3 rounded-lg border border-wedding-gold/30 shadow-sm hover:shadow-md
                                  ${snapshotDraggable.isDragging ? 'shadow-xl ring-2 ring-wedding-orange' : ''}
                                `}
                                onClick={() => setModalTask(task)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <Checkbox
                                      id={`task-checkbox-${task.task_id}`}
                                      checked={task.is_complete}
                                      onCheckedChange={(e) => {
                                        e.stopPropagation(); // Prevent modal from opening
                                        handleToggleComplete(task);
                                      }}
                                      aria-label={`Mark task ${task.title} as ${task.is_complete ? 'incomplete' : 'complete'}`}
                                      className="mt-1 border-wedding-gold data-[state=checked]:bg-wedding-gold data-[state=checked]:text-white"
                                    />
                                    <div className="min-w-0">
                                      <h4 className="font-medium text-sm text-wedding-brown truncate" title={task.title}>
                                        {task.title}
                                      </h4>
                                      {task.description && (
                                        <p className="text-xs text-wedding-brown/70 truncate mt-0.5" title={task.description}>
                                          {task.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border self-start
                                    ${task.priority === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                      'bg-green-100 text-green-700 border-green-200'
                                    }`}>
                                    {task.priority}
                                  </div>
                                </div>
                                {(task.due_date || task.category) && (
                                  <div className="mt-2 pt-2 border-t border-wedding-gold/10 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                    {task.due_date && (
                                      <div className="flex items-center text-wedding-brown/70">
                                        <CalendarDays className="h-3 w-3 mr-1" />
                                        <span>{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                      </div>
                                    )}
                                    {task.category && (
                                      <span className="bg-wedding-cream px-1.5 py-0.5 rounded text-wedding-orange border border-wedding-orange/50">
                                        {task.category}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}

      {modalTask && (
        <TaskDetailModal
          task={modalTask}
          open={!!modalTask}
          onClose={() => setModalTask(null)}
          onSave={handleModalSave} // Already async
          onDelete={handleDeleteTask} // Already async
        />
      )}

      {tasks.length > tasksPerPage && ( // Show pagination only if needed
        <div className="glass-card p-3 mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(processedTasks.length / tasksPerPage)} // Paginate based on processed tasks
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

export default TaskTracker;
