// src/types/task.ts

export type TaskPriority = 'Alta' | 'Media' | 'Baja';
export type TaskStatus = 'Pendiente' | 'Completada';

export interface Task {
  id: string; // PostgreSQL document ID
  task_name: string; // Specific name for this task instance
  type: string; // Name of the TaskType (selected from a managed list)
  start_date?: Date; // Optional start date, Changed from Timestamp
  due_date: Date; // Changed from Timestamp
  priority: TaskPriority;
  status: TaskStatus;
  case_id?: string; // ID of the associated Case
  case_name?: string; // Denormalized name of the associated Case for easy display
  description?: string;
  created_at: Date; // Changed from Timestamp
  updated_at?: Date; // Changed from Timestamp
}
