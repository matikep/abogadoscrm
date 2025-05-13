// src/app/dashboard/task-types/actions.ts
'use server';

import { db } from '@/lib/db';
import type { TaskType } from '@/types/task-type';
import type { TaskTypeFormValues } from '@/components/task-type-form';

export const fetchTaskTypesAction = async (): Promise<TaskType[]> => {
  const result = await db.query('SELECT id, name, created_at, updated_at FROM task_types ORDER BY created_at DESC');
  return result.rows.map(row => ({
    id: row.id.toString(),
    name: row.name,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at ? row.updated_at : row.created_at),
  }));
};

export const addTaskTypeAction = async (newType: TaskTypeFormValues): Promise<string> => {
  const result = await db.query(
    'INSERT INTO task_types (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id',
    [newType.name]
  );
  return result.rows[0].id.toString();
};

export const updateTaskTypeAction = async ({ id, values }: { id: string; values: TaskTypeFormValues }): Promise<void> => {
  await db.query(
    'UPDATE task_types SET name = $1, updated_at = NOW() WHERE id = $2',
    [values.name, parseInt(id, 10)]
  );
};

export const deleteTaskTypeAction = async (id: string): Promise<void> => {
  await db.query('DELETE FROM task_types WHERE id = $1', [parseInt(id, 10)]);
};