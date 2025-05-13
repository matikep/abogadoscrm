// src/app/dashboard/cases/actions.ts
'use server';

import { db } from '@/lib/db';
import type { Case, CasePaymentStatus } from '@/types/case';
import type { CaseFormValues } from '@/components/case-form';

// Fetch cases function from PostgreSQL
export const fetchCasesAction = async (): Promise<Case[]> => {
  const result = await db.query(
    'SELECT id, case_number, client_name, status, type, assigned_lawyer, created_at, opening_date, updated_at, payment_status, amount_paid, total_billed FROM cases ORDER BY created_at DESC'
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
    payment_status: row.payment_status as CasePaymentStatus || 'Pendiente de Facturación',
    amount_paid: parseFloat(row.amount_paid || 0),
    total_billed: parseFloat(row.total_billed || 0),
  }));
};

// Delete case function from PostgreSQL
export const deleteCaseAction = async (caseId: string): Promise<void> => {
  await db.query('DELETE FROM cases WHERE id = $1', [parseInt(caseId, 10)]);
};

// Add case function to PostgreSQL
export const addCaseAction = async (newCase: Omit<CaseFormValues, 'id'>): Promise<string> => {
  const { 
    caseNumber, clientName, type, status, assignedLawyer, 
    description, openingDate, paymentStatus, amountPaid 
  } = newCase;
  
  const totalBilled = 0; 

  const result = await db.query(
    `INSERT INTO cases (case_number, client_name, type, status, assigned_lawyer, description, opening_date, payment_status, amount_paid, total_billed, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id`,
    [
      caseNumber, clientName, type, status, assignedLawyer, 
      description, openingDate, paymentStatus, amountPaid ?? 0, totalBilled
    ]
  );
  return result.rows[0].id.toString();
};