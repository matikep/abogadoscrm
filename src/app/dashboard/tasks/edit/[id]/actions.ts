// src/app/dashboard/tasks/edit/[id]/actions.ts
'use server';

import { db } from '@/lib/db';
import type { Task } from '@/types/task';
import type { TaskFormValues } from '@/components/task-form';

export const fetchTaskAction = async (id: string): Promise<Task | null> => {
  const result = await db.query('SELECT id, task_name, type, start_date, due_date, priority, status, case_id, case_name, description, created_at, updated_at FROM tasks WHERE id = $1', [parseInt(id, 10)]);
  if (result.rows.length === 0) {
    console.error("No such task document!");
    return null;
  }
  const row = result.rows[0];
  return {
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
  };
};

export const updateTaskAction = async ({ id, values }: { id: string; values: Partial<TaskFormValues> & { case_name?: string } }) => {
  const { taskName, type, startDate, dueDate, priority, status, caseId, description, case_name } = values;
  await db.query(
    'UPDATE tasks SET task_name = $1, type = $2, start_date = $3, due_date = $4, priority = $5, status = $6, case_id = $7, case_name = $8, description = $9, updated_at = NOW() WHERE id = $10',
    [taskName, type, startDate, dueDate, priority, status, caseId ? parseInt(caseId, 10) : null, case_name, description, parseInt(id, 10)]
  );
};