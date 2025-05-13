import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ClientsLoading() {
  return (
     <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" /> {/* Title Skeleton */}
         <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" /> {/* Card Title Skeleton */}
          <Skeleton className="h-4 w-full max-w-md" /> {/* Card Description Skeleton */}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-center">Casos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-9 w-9 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell> {/* Badge Skeleton */}
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell> {/* Actions Skeleton */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
