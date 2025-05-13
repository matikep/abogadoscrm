// src/app/dashboard/billing/rates/page.tsx
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, ReceiptText, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { BillableItemForm, type BillableItemFormValues } from '@/components/billable-item-form';
import type { BillableItem } from '@/types/billable-item';
import RatesLoading from './loading';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  fetchBillableItemsAction, 
  addBillableItemAction, 
  updateBillableItemAction, 
  deleteBillableItemAction 
} from './actions'; // Import Server Actions

export default function RatesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BillableItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: billableItems, isLoading, error } = useQuery<BillableItem[]>({
    queryKey: ['billableItems'],
    queryFn: fetchBillableItemsAction,
  });

  const addMutation = useMutation({
    mutationFn: addBillableItemAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billableItems'] });
      toast({ title: "Tarifa Creada", description: "La nueva tarifa/servicio ha sido añadida." });
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (err: any) => toast({ title: "Error", description: `No se pudo crear la tarifa: ${err.message}`, variant: "destructive" }),
    onSettled: () => setIsSubmitting(false),
  });

  const updateMutation = useMutation({
    mutationFn: updateBillableItemAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billableItems'] });
      toast({ title: "Tarifa Actualizada", description: "La tarifa/servicio ha sido actualizada." });
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (err: any) => toast({ title: "Error", description: `No se pudo actualizar la tarifa: ${err.message}`, variant: "destructive" }),
    onSettled: () => setIsSubmitting(false),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBillableItemAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billableItems'] });
      toast({ title: "Tarifa Eliminada", description: "La tarifa/servicio ha sido eliminada." });
    },
    onError: (err: any) => toast({ title: "Error al Eliminar", description: `No se pudo eliminar la tarifa: ${err.message}. Verifique que no esté en uso.`, variant: "destructive" }),
  });

  const handleFormSubmit = async (values: BillableItemFormValues) => {
    setIsSubmitting(true);
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, values });
    } else {
      addMutation.mutate(values);
    }
  };

  const openAddForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item: BillableItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta tarifa/servicio? Esta acción no se puede deshacer.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <RatesLoading />;
  if (error) return <div className="p-4 sm:p-6">Error al cargar las tarifas: {(error as Error).message}</div>;

  return (
    <div className="space-y-6 p-4 sm:p-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2 animate-fadeInLeft">
          <ReceiptText className="h-8 w-8" /> Tarifas y Servicios
        </h2>
        <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingItem(null); }}>
          <DialogTrigger asChild>
            <Button onClick={openAddForm} className="transition-all duration-150 ease-in-out active:scale-95 hover:shadow-lg animate-fadeInRight">
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nueva Tarifa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md animate-fadeInScale">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar' : 'Añadir Nueva'} Tarifa/Servicio</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Modifica los detalles de la tarifa o servicio.' : 'Define una nueva tarifa o servicio facturable.'}
              </DialogDescription>
            </DialogHeader>
            <BillableItemForm
              onSubmit={handleFormSubmit}
              initialData={editingItem || undefined}
              isSubmitting={isSubmitting || addMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-muted-foreground animate-fadeInUp" data-delay="100">
        Gestiona las tarifas y servicios que se pueden asociar a los casos para la facturación.
      </p>

      <Card className="shadow-xl transition-shadow duration-300 hover:shadow-2xl animate-fadeInUp" data-delay="200">
        <CardHeader>
            <CardTitle>Listado de Tarifas y Servicios</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-1/3">Nombre</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead className="w-1/3">Descripción</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {billableItems && billableItems.length > 0 ? (
                    billableItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/50 transition-colors duration-150 animate-fadeIn">
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-xs" title={item.description}>{item.description || '-'}</TableCell>
                        <TableCell>{format(item.created_at, 'P', { locale: es })}</TableCell>
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
                                <DropdownMenuItem onClick={() => openEditForm(item)} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={() => handleDelete(item.id)} 
                                    className="text-destructive cursor-pointer"
                                    disabled={deleteMutation.isPending && deleteMutation.variables === item.id}
                                >
                                  {deleteMutation.isPending && deleteMutation.variables === item.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                  Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                        No se encontraron tarifas. Comienza añadiendo una nueva.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
