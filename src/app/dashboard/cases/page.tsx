// src/app/dashboard/cases/page.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, DollarSign, CheckCircle, XCircle, AlertCircle, Hourglass, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import CasesLoading from './loading'; 
import type { Case, CasePaymentStatus } from '@/types/case'; 
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fetchCasesAction, deleteCaseAction } from './actions'; // Import Server Actions

export default function CasesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cases, isLoading, error } = useQuery<Case[]>({
    queryKey: ['cases'],
    queryFn: fetchCasesAction,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCaseAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({
        title: "Caso eliminado",
        description: "El caso ha sido eliminado exitosamente.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al Eliminar",
        description: `No se pudo eliminar el caso: ${error.message}. Verifique que no tenga tareas o facturas asociadas.`,
        variant: "destructive",
      });
      console.error("Error deleting case:", error);
    },
  });

  const handleAddCase = () => {
    router.push('/dashboard/cases/new');
  };

  const handleEditCase = (caseId: string) => {
    router.push(`/dashboard/cases/edit/${caseId}`);
  };

  const handleDeleteCase = (caseId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este caso? Esta acción podría ser irreversible y eliminar datos asociados.")) {
      deleteMutation.mutate(caseId);
    }
  };

  const getCaseStatusBadgeVariant = (status: Case['status']): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'Abierto': return 'default'; 
      case 'Cerrado': return 'secondary';
      case 'Pendiente': return 'outline'; 
      case 'Archivado': return 'destructive'; 
      default: return 'secondary';
    }
  };

  const getPaymentStatusInfo = (status?: CasePaymentStatus): { text: string; icon: React.ReactNode, variant: "default" | "secondary" | "outline" | "destructive" | "warning" } => {
    switch (status) {
      case 'Pendiente de Facturación': return { text: 'Pend. Fact.', icon: <Hourglass className="h-3 w-3" />, variant: 'outline' };
      case 'Facturado - Pendiente de Pago': return { text: 'Facturado', icon: <AlertCircle className="h-3 w-3" />, variant: 'warning' as any };
      case 'Abono Realizado': return { text: 'Abonado', icon: <DollarSign className="h-3 w-3" />, variant: 'default' };
      case 'Pagado Completo': return { text: 'Pagado', icon: <CheckCircle className="h-3 w-3" />, variant: 'default' };
      case 'Anulado': return { text: 'Anulado', icon: <XCircle className="h-3 w-3" />, variant: 'destructive' };
      default: return { text: 'N/A', icon: null, variant: 'secondary' };
    }
  };


  if (isLoading) return <CasesLoading />;
  if (error) return <div className="p-4 sm:p-6">Error al cargar los casos: {(error as Error).message}</div>;

  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Casos</h2>
        <Button onClick={handleAddCase} className="transition-all duration-150 ease-in-out active:scale-95 hover:shadow-lg">
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Caso
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border shadow-xl transition-shadow duration-300 hover:shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Número de Caso</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado Caso</TableHead>
              <TableHead>Estado Pago</TableHead>
              <TableHead className="text-right">Facturado</TableHead>
              <TableHead className="text-right">Pagado</TableHead>
              <TableHead>Abogado</TableHead>
              <TableHead>Apertura</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases && cases.length > 0 ? (
              cases.map((caseItem) => {
                const paymentStatusInfo = getPaymentStatusInfo(caseItem.payment_status);
                return (
                <TableRow key={caseItem.id} className="hover:bg-muted/50 transition-colors duration-150 animate-fadeIn">
                  <TableCell className="font-medium">{caseItem.case_number}</TableCell>
                  <TableCell>{caseItem.client_name}</TableCell>
                  <TableCell>{caseItem.type}</TableCell>
                  <TableCell>
                    <Badge variant={getCaseStatusBadgeVariant(caseItem.status)} className="text-xs px-2 py-0.5">
                      {caseItem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={paymentStatusInfo.variant} className="text-xs px-2 py-0.5 flex items-center gap-1">
                      {paymentStatusInfo.icon}
                      {paymentStatusInfo.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${(caseItem.total_billed ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right text-green-600">${(caseItem.amount_paid ?? 0).toFixed(2)}</TableCell>
                  <TableCell>{caseItem.assigned_lawyer}</TableCell>
                  <TableCell>
                    {caseItem.opening_date 
                      ? format(caseItem.opening_date, 'P', { locale: es })
                      : format(caseItem.created_at, 'P', { locale: es })}
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditCase(caseItem.id)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Editar / Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCase(caseItem.id)} 
                          className="text-destructive cursor-pointer"
                          disabled={deleteMutation.isPending && deleteMutation.variables === caseItem.id}
                        >
                          {deleteMutation.isPending && deleteMutation.variables === caseItem.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No se encontraron casos. Comienza añadiendo uno nuevo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
