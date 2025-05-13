// src/app/dashboard/billing/rates/actions.ts
'use server';

import { db } from '@/lib/db';
import type { BillableItem } from '@/types/billable-item';
import type { BillableItemFormValues } from '@/components/billable-item-form';

export const fetchBillableItemsAction = async (): Promise<BillableItem[]> => {
  const result = await db.query('SELECT id, name, price, description, created_at, updated_at FROM billable_items ORDER BY created_at DESC');
  return result.rows.map(row => ({
    id: row.id.toString(),
    name: row.name,
    price: parseFloat(row.price),
    description: row.description,
    created_at: new Date(row.created_at),
    updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
  }));
};

export const addBillableItemAction = async (newItem: BillableItemFormValues): Promise<string> => {
  const result = await db.query(
    'INSERT INTO billable_items (name, price, description, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
    [newItem.name, newItem.price, newItem.description]
  );
  return result.rows[0].id.toString();
};

export const updateBillableItemAction = async ({ id, values }: { id: string; values: BillableItemFormValues }): Promise<void> => {
  await db.query(
    'UPDATE billable_items SET name = $1, price = $2, description = $3, updated_at = NOW() WHERE id = $4',
    [values.name, values.price, values.description, parseInt(id, 10)]
  );
};

export const deleteBillableItemAction = async (id: string): Promise<void> => {
  await db.query('DELETE FROM billable_items WHERE id = $1', [parseInt(id, 10)]);
};