// src/app/dashboard/tasks/actions.ts
'use server';

import { db } from '@/lib/db';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';
import type { TaskFormValues } from '@/components/task-form';

export const fetchTasksAction = async (): Promise<Task[]> => {
  const result = await db.query('SELECT id, task_name, type, start_date, due_date, priority, status, case_id, case_name, description, created_at, updated_at FROM tasks ORDER BY due_date ASC');
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
  await db.query(
    'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2',
    [newStatus, parseInt(id, 10)]
  );
};

export const deleteTaskAction = async (id: string): Promise<void> => {
  await db.query('DELETE FROM tasks WHERE id = $1', [parseInt(id, 10)]);
};

export const addTaskAction = async (newTask: Omit<TaskFormValues, 'id'> & { case_name?: string }): Promise<string> => {
  const { taskName, type, startDate, dueDate, priority, status, caseId, description, case_name } = newTask;
  const result = await db.query(
    'INSERT INTO tasks (task_name, type, start_date, due_date, priority, status, case_id, case_name, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id',
    [taskName, type, startDate, dueDate, priority, status, caseId ? parseInt(caseId, 10) : null, case_name, description]
  );
  return result.rows[0].id.toString();
};