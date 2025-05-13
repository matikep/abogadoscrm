// src/app/dashboard/cases/edit/[id]/actions.ts
'use server';

import { db } from '@/lib/db';
import type { Case, CasePaymentStatus } from '@/types/case';
import type { CaseFormValues } from '@/components/case-form';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';
import type { BillableItem } from '@/types/billable-item';
import type { CaseBillingItem } from '@/types/case-billing-item';
import { QueryClient } from '@tanstack/react-query';


interface CaseDataFromDB extends Case {
  total_billed_calculated?: number;
}

export const fetchCaseAction = async (id: string): Promise<CaseDataFromDB | null> => {
  const caseResult = await db.query(
    `SELECT id, case_number, client_name, status, type, assigned_lawyer, description, opening_date, payment_status, amount_paid, total_billed, created_at, updated_at 
     FROM cases WHERE id = $1`,
    [parseInt(id, 10)]
  );

  if (caseResult.rows.length === 0) return null;
  const caseRow = caseResult.rows[0];

  const billingItemsResult = await db.query(
    'SELECT SUM(total) as total_billed_sum FROM case_billing_items WHERE case_id = $1',
    [parseInt(id, 10)]
  );
  const totalBilledFromItems = parseFloat(billingItemsResult.rows[0]?.total_billed_sum || 0);
  
  if (parseFloat(caseRow.total_billed || 0) !== totalBilledFromItems) {
      await db.query('UPDATE cases SET total_billed = $1, updated_at = NOW() WHERE id = $2', [totalBilledFromItems, parseInt(id,10)]);
      caseRow.total_billed = totalBilledFromItems;
  }

  return {
    id: caseRow.id.toString(),
    case_number: caseRow.case_number,
    client_name: caseRow.client_name,
    status: caseRow.status as Case['status'],
    type: caseRow.type,
    assigned_lawyer: caseRow.assigned_lawyer,
    description: caseRow.description,
    opening_date: caseRow.opening_date ? new Date(caseRow.opening_date) : undefined,
    payment_status: caseRow.payment_status as CasePaymentStatus || 'Pendiente de Facturación',
    amount_paid: parseFloat(caseRow.amount_paid || 0),
    total_billed: parseFloat(caseRow.total_billed || 0),
    created_at: new Date(caseRow.created_at),
    updated_at: caseRow.updated_at ? new Date(caseRow.updated_at) : undefined,
  };
};

export const updateCaseDetailsAction = async ({ id, values }: { id: string; values: Partial<CaseFormValues> & { opening_date: Date | null } }) => {
  const { caseNumber, clientName, type, status, assignedLawyer, description, opening_date, paymentStatus, amountPaid } = values;
  await db.query(
    `UPDATE cases SET 
      case_number = $1, client_name = $2, type = $3, status = $4, assigned_lawyer = $5, 
      description = $6, opening_date = $7, payment_status = $8, amount_paid = $9, updated_at = NOW()
     WHERE id = $10`,
    [
      caseNumber, clientName, type, status, assignedLawyer, description, opening_date, 
      paymentStatus, amountPaid ?? 0, parseInt(id, 10)
    ]
  );
};

export const fetchCaseTasksAction = async (caseId: string): Promise<Task[]> => {
  const result = await db.query(
    'SELECT id, task_name, type, start_date, due_date, priority, status, case_id, case_name, description, created_at, updated_at FROM tasks WHERE case_id = $1 ORDER BY due_date ASC',
    [parseInt(caseId, 10)]
  );
  return result.rows.map(row => ({
    id: row.id.toString(),
    task_name: row.task_name,
    type: row.type,
    start_date: row.start_date ? new Date(row.start_date) : undefined,
    due_date: new Date(row.due_date),
    priority: row.priority as TaskPriority,
    status: row.status as TaskStatus,
    case_id: row.case_id?.toString(),
    case_name: row.case_name,
    description: row.description,
    created_at: new Date(row.created_at),
    updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
  }));
};

export const toggleTaskStatusAction = async ({ id, currentStatus }: { id:string; currentStatus: TaskStatus }) => { 
  const newStatus: TaskStatus = currentStatus === 'Pendiente' ? 'Completada' : 'Pendiente';
  await db.query('UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, parseInt(id, 10)]);
};

export const deleteTaskAction = async (id: string) => { 
  await db.query('DELETE FROM tasks WHERE id = $1', [parseInt(id, 10)]);
};

export const fetchGenericBillableItemsAction = async (): Promise<BillableItem[]> => {
  const result = await db.query('SELECT id, name, price, description, created_at FROM billable_items ORDER BY name ASC');
  return result.rows.map(row => ({
    id: row.id.toString(),
    name: row.name,
    price: parseFloat(row.price),
    description: row.description,
    created_at: new Date(row.created_at),
  }));
};

export const fetchCaseBillingItemsAction = async (caseId: string): Promise<CaseBillingItem[]> => {
  const result = await db.query(
    'SELECT id, case_id, billable_item_id, name, price_at_time_of_billing, quantity, total, created_at FROM case_billing_items WHERE case_id = $1 ORDER BY created_at DESC',
    [parseInt(caseId, 10)]
  );
  return result.rows.map(row => ({
    id: row.id.toString(),
    case_id: row.case_id.toString(),
    billable_item_id: row.billable_item_id.toString(),
    name: row.name,
    price_at_time_of_billing: parseFloat(row.price_at_time_of_billing),
    quantity: parseInt(row.quantity, 10),
    total: parseFloat(row.total),
    created_at: new Date(row.created_at),
  }));
};

export const addBillingItemToCaseAction = async (item: { caseId: string; billableItemId: string; quantity: number; priceAtTimeOfBilling: number; name: string }): Promise<string> => {
  const total = item.priceAtTimeOfBilling * item.quantity;
  const result = await db.query(
    'INSERT INTO case_billing_items (case_id, billable_item_id, name, price_at_time_of_billing, quantity, total, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id',
    [parseInt(item.caseId, 10), parseInt(item.billableItemId, 10), item.name, item.priceAtTimeOfBilling, item.quantity, total]
  );
  // This function needs to trigger a re-fetch or update of the case's total_billed.
  // Since this is a server action, it cannot directly call queryClient.invalidateQueries.
  // The component calling this action will handle cache invalidation.
  return result.rows[0].id.toString();
};

export const deleteCaseBillingItemAction = async (id: string): Promise<void> => {
  await db.query('DELETE FROM case_billing_items WHERE id = $1', [parseInt(id, 10)]);
  // Similar to addBillingItemToCaseAction, cache invalidation will be handled by the calling component.
};

export const updateTotalBilledForCaseAction = async (caseId: string): Promise<void> => {
  const billingItemsResult = await db.query(
    'SELECT SUM(total) as total_billed_sum FROM case_billing_items WHERE case_id = $1',
    [parseInt(caseId, 10)]
  );
  const newTotalBilled = parseFloat(billingItemsResult.rows[0]?.total_billed_sum || 0);
  await db.query('UPDATE cases SET total_billed = $1, updated_at = NOW() WHERE id = $2', [newTotalBilled, parseInt(caseId, 10)]);
};