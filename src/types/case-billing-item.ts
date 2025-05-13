// src/types/case-billing-item.ts

export interface CaseBillingItem {
  id: string; // PostgreSQL document ID
  case_id: string;
  billable_item_id: string; // Reference to the generic BillableItem
  name: string; // Denormalized from BillableItem
  price_at_time_of_billing: number; // Price of the BillableItem at the time it was added to the case
  quantity: number;
  total: number; // price_at_time_of_billing * quantity
  created_at: Date; // Changed from Timestamp
  updated_at?: Date; // Changed from Timestamp
}
