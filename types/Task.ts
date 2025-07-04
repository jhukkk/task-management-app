export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
  priority?: string;
  folder?: string;
}

export interface TaskState {
  tasks: Task[];
}

export type TaskAction = 
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt'> }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Omit<Task, 'id' | 'createdAt'>> } }
  | { type: 'LOAD_TASKS'; payload: Task[] }; 