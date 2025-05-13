// src/types/document.ts

// Using DocumentFile to avoid potential naming conflicts with a global Document type
export interface DocumentFile {
  id: string; // PostgreSQL document ID
  file_name: string;
  file_type: string; // MIME type
  file_url: string; // Firebase Storage URL (or other storage)
  storage_path: string; // Full path in Storage, for deletion
  case_id?: string; // Optional: ID of the associated Case
  case_name?: string; // Optional: Denormalized name of the associated Case for display
  document_type?: string; // Optional: User-defined type like "Contrato", "Demanda"
  version: number; // For version control, starts at 1
  description?: string; // Optional description for the document
  uploaded_by?: string; // Optional: User who uploaded the document
  created_at: Date; // Changed from Timestamp
  updated_at?: Date; // Changed from Timestamp
}
