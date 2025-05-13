// src/types/case.ts

export type CasePaymentStatus = 
  | 'Pendiente de Facturación' 
  | 'Facturado - Pendiente de Pago' 
  | 'Abono Realizado' 
  | 'Pagado Completo' 
  | 'Anulado';

export interface Case {
  id: string;
  case_number: string;
  client_name: string;
  status: 'Abierto' | 'Cerrado' | 'Pendiente' | 'Archivado';
  type: string;
  assigned_lawyer: string;
  created_at: Date; // Changed from Timestamp
  opening_date?: Date; // Changed from Timestamp
  description?: string;
  updated_at?: Date; // Changed from Timestamp
  // Billing related fields
  payment_status?: CasePaymentStatus;
  amount_paid?: number; // Amount paid by the client
  total_billed?: number; // Total amount billed for the case from associated billable items
}
