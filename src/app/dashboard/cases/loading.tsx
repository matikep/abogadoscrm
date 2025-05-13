import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function CasesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" /> {/* Title Skeleton */}
         <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Caso
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número de Caso</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado Caso</TableHead>
            <TableHead>Estado Pago</TableHead>
            <TableHead className="text-right">Facturado</TableHead>
            <TableHead className="text-right">Pagado</TableHead>
            <TableHead>Abogado</TableHead>
            <TableHead>Apertura</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell> {/* Case Status Badge */}
              <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell> {/* Payment Status Badge */}
              <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell> {/* Total Billed */}
              <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell> {/* Amount Paid */}
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell> {/* Actions Skeleton */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
