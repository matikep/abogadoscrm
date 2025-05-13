import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export default function DocumentsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Skeleton className="h-8 w-72" /> {/* Title Skeleton */}
      </div>
      
      <p className="text-muted-foreground max-w-2xl">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </p>

      {/* Upload Document Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-1" /> {/* Card Title: Cargar Nuevo Documento */}
          <Skeleton className="h-4 w-full max-w-md" /> {/* Card Description */}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" /> {/* Label: Archivo */}
            <Skeleton className="h-10 w-full max-w-md" /> {/* Input: File */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" /> {/* Label: Asociar a Caso */}
            <Skeleton className="h-10 w-full max-w-md" /> {/* Select: Case */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" /> {/* Label: Tipo de Documento */}
            <Skeleton className="h-10 w-full max-w-md" /> {/* Input: Document Type */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" /> {/* Label: Descripción */}
            <Skeleton className="h-20 w-full max-w-md" /> {/* Textarea: Description */}
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled className="w-full sm:w-auto">
            <UploadCloud className="mr-2 h-4 w-4" />
            Cargando Documento...
          </Button>
        </CardFooter>
      </Card>

      {/* Document Repository Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56 mb-1" /> {/* Card Title: Repositorio de Documentos */}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-4 w-32" /></TableHead> {/* Nombre Archivo */}
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead> {/* Caso */}
                  <TableHead><Skeleton className="h-4 w-28" /></TableHead> {/* Tipo */}
                  <TableHead><Skeleton className="h-4 w-20" /></TableHead> {/* Fecha Carga */}
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead> {/* Versión */}
                  <TableHead className="text-right"><Skeleton className="h-4 w-20" /></TableHead> {/* Acciones */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
           <div className="text-center text-muted-foreground py-10">
            <Skeleton className="h-4 w-64 mx-auto" /> {/* No documents found skeleton */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
