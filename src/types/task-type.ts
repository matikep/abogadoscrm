// src/types/task-type.ts

export interface TaskType {
  id: string; // PostgreSQL document ID
  name: string;
  created_at: Date; // Changed from Timestamp
  updated_at?: Date; // Changed from Timestamp
}
