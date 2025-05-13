// src/app/dashboard/documents/actions.ts
'use server';

import { db } from '@/lib/db';
import type { Case } from '@/types/case';
import type { DocumentFile } from '@/types/document';
import { storage } from '@/lib/firebase'; // Firebase Storage for file operations
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export const fetchCasesForDocumentDropdownAction = async (): Promise<Case[]> => {
  const result = await db.query('SELECT id, case_number, client_name FROM cases ORDER BY case_number ASC');
  return result.rows.map(row => ({
    id: row.id.toString(),
    case_number: row.case_number,
    client_name: row.client_name,
    status: 'Abierto', 
    type: '',
    assigned_lawyer: '',
    created_at: new Date(),
  }));
};

export const fetchDocumentsAction = async (): Promise<DocumentFile[]> => {
  const result = await db.query('SELECT id, file_name, file_type, file_url, storage_path, case_id, case_name, document_type, version, description, created_at FROM documents ORDER BY created_at DESC');
  return result.rows.map(row => ({
    id: row.id.toString(),
    file_name: row.file_name,
    file_type: row.file_type,
    file_url: row.file_url,
    storage_path: row.storage_path,
    case_id: row.case_id?.toString(),
    case_name: row.case_name,
    document_type: row.document_type,
    version: parseInt(row.version, 10),
    description: row.description,
    created_at: new Date(row.created_at),
  }));
};

interface UploadDocumentParams {
    fileName: string;
    fileType: string;
    fileURL: string;
    storagePath: string;
    caseId?: string;
    caseName?: string;
    documentType?: string;
    description?: string;
}

export const saveDocumentMetadataAction = async (docData: UploadDocumentParams): Promise<void> => {
    const newDocumentData: Omit<DocumentFile, 'id' | 'created_at' | 'updated_at'> = {
        file_name: docData.fileName,
        file_type: docData.fileType,
        file_url: docData.fileURL,
        storage_path: docData.storagePath,
        case_id: docData.caseId && docData.caseId !== "" ? docData.caseId : undefined,
        case_name: docData.caseName || undefined,
        document_type: docData.documentType?.trim() || undefined,
        description: docData.description?.trim() || undefined,
        version: 1, // Initial version
      };
      
      await db.query(
        `INSERT INTO documents (file_name, file_type, file_url, storage_path, case_id, case_name, document_type, description, version, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          newDocumentData.file_name, newDocumentData.file_type, newDocumentData.file_url, newDocumentData.storage_path,
          newDocumentData.case_id ? parseInt(newDocumentData.case_id,10) : null, newDocumentData.case_name, newDocumentData.document_type, 
          newDocumentData.description, newDocumentData.version
        ]
      );
};


export const deleteDocumentAction = async (docToDelete: { id: string; storage_path: string }): Promise<void> => {
    // Delete from Storage
    const fileStorageRef = storageRef(storage, docToDelete.storage_path);
    try {
      await deleteObject(fileStorageRef);
    } catch (error: any) {
      if (error.code !== 'storage/object-not-found') {
        console.error("Error deleting from Firebase Storage:", error);
        // Potentially re-throw or handle more gracefully
      }
      console.warn(`File not found in Storage or error deleting, proceeding to delete DB record: ${docToDelete.storage_path}`);
    }
    // Delete metadata from PostgreSQL
    await db.query('DELETE FROM documents WHERE id = $1', [parseInt(docToDelete.id, 10)]);
  };