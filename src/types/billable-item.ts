// src/types/billable-item.ts

export interface BillableItem {
  id: string; // PostgreSQL document ID (likely string representation of integer)
  name: string;
  price: number; // Store as a number, currency formatting in UI
  description?: string;
  created_at: Date; // Changed from Timestamp
  updated_at?: Date; // Changed from Timestamp
}
