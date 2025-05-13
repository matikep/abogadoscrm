// src/app/dashboard/actions.ts
'use server';

import { db } from '@/lib/db';
import type { Case } from '@/types/case';
import type { Task } from '@/types/task';

export const fetchCasesForDashboardAction = async (): Promise<Case[]> => {
  const result = await db.query(
    'SELECT id, case_number, client_name, status, type, assigned_lawyer, created_at, opening_date, updated_at, payment_status, amount_paid, total_billed FROM cases'
  );
  return result.rows.map(row => ({
    id: row.id.toString(),
    case_number: row.case_number,
    client_name: row.client_name,
    status: row.status as Case['status'],
    type: row.type,
    assigned_lawyer: row.assigned_lawyer,
    created_at: new Date(row.created_at),
    opening_date: row.opening_date ? new Date(row.opening_date) : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
    payment_status: row.payment_status as Case['payment_status'] || 'Pendiente de Facturación',
    amount_paid: parseFloat(row.amount_paid || 0),
    total_billed: parseFloat(row.total_billed || 0),
  }));
};

export const fetchTasksForDashboardAction = async (): Promise<Task[]> => {
  const result = await db.query(
    'SELECT id, task_name, type, start_date, due_date, priority, status, case_id, case_name, description, created_at, updated_at FROM tasks ORDER BY due_date ASC'
  );
  return result.rows.map(row => ({
    id: row.id.toString(),
    task_name: row.task_name,
    type: row.type,
    start_date: row.start_date ? new Date(row.start_date) : undefined,
    due_date: new Date(row.due_date),
    priority: row.priority as Task['priority'],
    status: row.status as Task['status'],
    case_id: row.case_id?.toString(),
    case_name: row.case_name,
    description: row.description,
    created_at: new Date(row.created_at),
    updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
  }));
};