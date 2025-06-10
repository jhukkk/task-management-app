import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Task, TaskAction, TaskState } from '../types/Task';

// Initial state for task management
const initialState: TaskState = {
  tasks: [],
};

/**
 * Reducer function to handle all task-related state changes
 */
const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'ADD_TASK':
      const newTask: Task = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      return {
        ...state,
        tasks: [newTask, ...state.tasks], // Add new tasks to the beginning
      };
    
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        ),
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    
    case 'LOAD_TASKS':
      return {
        ...state,
        tasks: action.payload,
      };
    
    default:
      return state;
  }
};

// Context type definition
interface TaskContextType {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  addTask: (title: string, description?: string, dueDate?: Date, priority?: string, folder?: string) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  getTodayTasks: () => Task[]; // Currently unused but kept for future features
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

/**
 * Task provider component that manages global task state and persistence
 */
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load tasks from AsyncStorage on app start
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever tasks change
  useEffect(() => {
    saveTasks();
  }, [state.tasks]);

  /**
   * Load tasks from local storage and migrate old tasks to have folders
   */
  const loadTasks = async () => {
    try {
      const tasksJson = await AsyncStorage.getItem('tasks');
      if (tasksJson) {
        const tasks = JSON.parse(tasksJson).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          // Ensure all existing tasks have a folder (migrate old tasks to inbox)
          folder: task.folder || 'inbox',
        }));
        dispatch({ type: 'LOAD_TASKS', payload: tasks });
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  /**
   * Save tasks to local storage
   */
  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(state.tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  /**
   * Add a new task with optional parameters
   */
  const addTask = (title: string, description?: string, dueDate?: Date, priority?: string, folder?: string) => {
    const taskFolder = folder || 'inbox'; // Default to inbox if no folder specified
    dispatch({
      type: 'ADD_TASK',
      payload: { title, description, completed: false, dueDate, priority, folder: taskFolder },
    });
  };

  /**
   * Update specific fields of an existing task
   */
  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  };

  /**
   * Toggle completion status of a task
   */
  const toggleTask = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  };

  /**
   * Delete a task by ID
   */
  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  /**
   * Get tasks due today (currently unused but available for future features)
   */
  const getTodayTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return state.tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });
  };

  return (
    <TaskContext.Provider
      value={{
        state,
        dispatch,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        getTodayTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

/**
 * Hook to access task context. Must be used within TaskProvider.
 */
export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}; 