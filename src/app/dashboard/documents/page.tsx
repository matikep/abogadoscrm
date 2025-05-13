// src/app/dashboard/documents/page.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input as ShadInput } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { UploadCloud, Download, Trash2, MoreHorizontal, AlertCircle, Loader2, FileText, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storage } from '@/lib/firebase'; 
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Case } from '@/types/case';
import type { DocumentFile } from '@/types/document'; 
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DocumentsLoading from './loading';
import { 
  fetchCasesForDocumentDropdownAction, 
  fetchDocumentsAction, 
  saveDocumentMetadataAction,
  deleteDocumentAction
} from './actions'; // Import Server Actions

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png'];

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  const [isLoadingUpload, setIsLoadingUpload] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: cases, isLoading: isLoadingCases } = useQuery<Case[]>({
    queryKey: ['casesForDocumentUpload'],
    queryFn: fetchCasesForDocumentDropdownAction,
  });

  const { data: documents, isLoading: isLoadingDocuments, error: documentsError } = useQuery<DocumentFile[]>({
    queryKey: ['documentsList'],
    queryFn: fetchDocumentsAction,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setUploadError(`Tipo de archivo no soportado. Permitidos: PDF, DOC, DOCX, TXT, JPG, PNG.`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(`El archivo excede el tamaño máximo de ${MAX_FILE_SIZE_MB}MB.`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No hay archivo seleccionado.");
      setIsLoadingUpload(true);
      setUploadError(null);

      const tempDocId = Math.random().toString(36).substring(2, 15); 
      const filePath = `documents_repository/${tempDocId}/${selectedFile.name}`;
      const fileStorageRefInstance = storageRef(storage, filePath);

      await uploadBytes(fileStorageRefInstance, selectedFile);
      const fileURL = await getDownloadURL(fileStorageRefInstance);

      const selectedCase = cases?.find(c => c.id === selectedCaseId);
      
      await saveDocumentMetadataAction({
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileURL: fileURL,
        storagePath: filePath,
        caseId: selectedCaseId && selectedCaseId !== "" ? selectedCaseId : undefined,
        caseName: selectedCase ? `${selectedCase.case_number} - ${selectedCase.client_name}` : undefined,
        documentType: documentType.trim() || undefined,
        description: description.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast({ title: "Documento Cargado", description: "El archivo se ha subido y guardado exitosamente." });
      queryClient.invalidateQueries({ queryKey: ['documentsList'] });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedCaseId('');
      setDocumentType('');
      setDescription('');
    },
    onError: (error: any) => {
      setUploadError(`Error al cargar: ${error.message}`);
      toast({ title: "Error de Carga", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      setIsLoadingUpload(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (docToDelete: { id: string; storage_path: string }) => deleteDocumentAction(docToDelete),
    onSuccess: () => {
      toast({ title: "Documento Eliminado", description: "El documento ha sido eliminado." });
      queryClient.invalidateQueries({ queryKey: ['documentsList'] });
    },
    onError: (error: any) => {
      toast({ title: "Error al Eliminar", description: error.message, variant: "destructive" });
    }
  });

  const handleDeleteDocument = (docToDelete: DocumentFile) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${docToDelete.file_name}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate({ id: docToDelete.id, storage_path: docToDelete.storage_path });
    }
  };

  if (isLoadingDocuments || isLoadingCases) return <DocumentsLoading />;
  
  return (
    <div className="space-y-8 animate-fadeIn p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight animate-fadeInLeft">Gestión Documental</h2>
      </div>
      <p className="text-muted-foreground max-w-2xl animate-fadeInUp">
        Administra los documentos de tus casos. Sube nuevos archivos, organízalos por caso y tipo, y accede a ellos fácilmente.
      </p>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fadeInUp" data-delay="100">
        <CardHeader>
          <CardTitle>Cargar Nuevo Documento</CardTitle>
          <CardDescription>Sube archivos (PDF, DOCX, TXT, JPG, PNG) de hasta {MAX_FILE_SIZE_MB}MB.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid w-full max-w-md items-center gap-2">
            <Label htmlFor="document-file" className="font-semibold">Archivo</Label>
            <ShadInput 
              id="document-file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={ALLOWED_FILE_TYPES.join(',')}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              disabled={isLoadingUpload}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Seleccionado: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / (1024*1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="grid w-full max-w-md items-center gap-2">
            <Label htmlFor="case-select" className="font-semibold">Asociar a Caso (Opcional)</Label>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId} disabled={isLoadingCases || isLoadingUpload}>
              <SelectTrigger id="case-select">
                <SelectValue placeholder={isLoadingCases ? "Cargando casos..." : "Selecciona un caso"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Ninguno</SelectItem>
                {cases?.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.case_number} - {c.client_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full max-w-md items-center gap-2">
            <Label htmlFor="document-type" className="font-semibold">Tipo de Documento (Opcional)</Label>
            <ShadInput 
              id="document-type" 
              value={documentType} 
              onChange={(e) => setDocumentType(e.target.value)} 
              placeholder="Ej: Contrato, Demanda, Prueba" 
              disabled={isLoadingUpload}
            />
          </div>
          
          <div className="grid w-full max-w-md items-center gap-2">
            <Label htmlFor="document-description" className="font-semibold">Descripción (Opcional)</Label>
            <Textarea
              id="document-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del contenido o propósito del documento..."
              className="resize-y min-h-[80px]"
              disabled={isLoadingUpload}
            />
          </div>

          {uploadError && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error de Carga</AlertTitle>
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => uploadMutation.mutate()} disabled={!selectedFile || isLoadingUpload} className="w-full sm:w-auto transition-all duration-150 ease-in-out active:scale-95 hover:shadow-lg">
            {isLoadingUpload ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" /> Cargar Documento
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-xl transition-shadow duration-300 animate-fadeInUp" data-delay="200">
        <CardHeader>
          <CardTitle>Repositorio de Documentos</CardTitle>
           {documentsError && (
             <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error al Cargar Documentos</AlertTitle>
              <AlertDescription>{(documentsError as Error).message}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          {documents && documents.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Nombre Archivo</TableHead>
                    <TableHead>Caso Asociado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha Carga</TableHead>
                    <TableHead>Versión</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map(docFile => (
                    <TableRow key={docFile.id} className="hover:bg-muted/50 transition-colors duration-150">
                      <TableCell className="font-medium">
                        <a href={docFile.file_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary flex items-center gap-1.5">
                           <FileText size={16} className="text-muted-foreground"/> {docFile.file_name}
                        </a>
                      </TableCell>
                      <TableCell>{docFile.case_name || <span className="text-muted-foreground italic">N/A</span>}</TableCell>
                      <TableCell>{docFile.document_type || <span className="text-muted-foreground italic">N/A</span>}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground" title={docFile.description || undefined}>{docFile.description || <span className="italic">N/A</span>}</TableCell>
                      <TableCell>{format(docFile.created_at, 'PPp', { locale: es })}</TableCell>
                      <TableCell className="text-center">{docFile.version}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 transition-transform hover:scale-110">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="animate-fadeInScale">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem asChild className="cursor-pointer">
                               <a href={docFile.file_url} target="_blank" rel="noopener noreferrer" download={docFile.file_name}>
                                <Download className="mr-2 h-4 w-4" /> Descargar
                               </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteDocument(docFile)} 
                              className="text-destructive cursor-pointer" 
                              disabled={deleteMutation.isPending && deleteMutation.variables?.id === docFile.id}
                            >
                               {deleteMutation.isPending && deleteMutation.variables?.id === docFile.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                               Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <Info size={48} className="mx-auto mb-4 text-primary/50"/>
              <p className="text-lg font-medium">No hay documentos en el repositorio.</p>
              <p>Comienza cargando tu primer archivo utilizando el formulario de arriba.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
