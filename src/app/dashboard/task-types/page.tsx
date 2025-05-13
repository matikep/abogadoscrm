// src/app/dashboard/task-types/page.tsx
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { TaskTypeForm, type TaskTypeFormValues } from '@/components/task-type-form';
import type { TaskType } from '@/types/task-type';
import TaskTypesLoading from './loading';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  fetchTaskTypesAction, 
  addTaskTypeAction, 
  updateTaskTypeAction, 
  deleteTaskTypeAction 
} from './actions'; // Import Server Actions

export default function TaskTypesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<TaskType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: taskTypes, isLoading, error } = useQuery<TaskType[]>({
    queryKey: ['taskTypes'],
    queryFn: fetchTaskTypesAction,
  });

  const addMutation = useMutation({
    mutationFn: addTaskTypeAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTypes'] });
      toast({ title: "Tipo de Tarea Creado", description: "El nuevo tipo de tarea ha sido añadido." });
      setIsFormOpen(false);
      setEditingType(null);
    },
    onError: (err: any) => toast({ title: "Error", description: `No se pudo crear: ${err.message}`, variant: "destructive" }),
    onSettled: () => setIsSubmitting(false),
  });

  const updateMutation = useMutation({
    mutationFn: updateTaskTypeAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTypes'] });
      toast({ title: "Tipo de Tarea Actualizado", description: "El tipo de tarea ha sido actualizado." });
      setIsFormOpen(false);
      setEditingType(null);
    },
    onError: (err: any) => toast({ title: "Error", description: `No se pudo actualizar: ${err.message}`, variant: "destructive" }),
    onSettled: () => setIsSubmitting(false),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTaskTypeAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTypes'] });
      toast({ title: "Tipo de Tarea Eliminado", description: "El tipo de tarea ha sido eliminado." });
    },
    onError: (err: any) => {
      toast({ title: "Error al Eliminar", description: `No se pudo eliminar: ${err.message}. Puede estar en uso.`, variant: "destructive" });
    }
  });

  const handleFormSubmit = async (values: TaskTypeFormValues) => {
    setIsSubmitting(true);
    if (editingType) {
      updateMutation.mutate({ id: editingType.id, values });
    } else {
      addMutation.mutate(values);
    }
  };

  const openAddForm = () => {
    setEditingType(null);
    setIsFormOpen(true);
  };

  const openEditForm = (type: TaskType) => {
    setEditingType(type);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este tipo de tarea? Esta acción no se puede deshacer y podría afectar tareas existentes.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <TaskTypesLoading />;
  if (error) return <div className="p-4 sm:p-6">Error al cargar los tipos de tarea: {(error as Error).message}</div>;

  return (
    <div className="space-y-6 p-4 sm:p-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight animate-fadeInLeft">Tipos de Tarea</h2>
        <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingType(null); }}>
          <DialogTrigger asChild>
            <Button onClick={openAddForm} className="transition-all duration-150 ease-in-out active:scale-95 hover:shadow-lg animate-fadeInRight">
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] animate-fadeInScale">
            <DialogHeader>
              <DialogTitle>{editingType ? 'Editar' : 'Añadir Nuevo'} Tipo de Tarea</DialogTitle>
              <DialogDescription>
                {editingType ? 'Modifica el nombre del tipo de tarea.' : 'Crea un nuevo tipo de tarea para organizar tus actividades.'}
              </DialogDescription>
            </DialogHeader>
            <TaskTypeForm
              onSubmit={handleFormSubmit}
              initialData={editingType || undefined}
              isSubmitting={isSubmitting || addMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border shadow-xl transition-shadow duration-300 hover:shadow-2xl animate-fadeInUp">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/3">Nombre del Tipo de Tarea</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taskTypes && taskTypes.length > 0 ? (
              taskTypes.map((type) => (
                <TableRow key={type.id} className="hover:bg-muted/50 transition-colors duration-150 animate-fadeIn">
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{format(type.created_at, 'PPP', { locale: es })}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 transition-transform hover:scale-110">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="animate-fadeInScale">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditForm(type)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(type.id)} 
                          className="text-destructive cursor-pointer"
                          disabled={deleteMutation.isPending && deleteMutation.variables === type.id}
                        >
                          {deleteMutation.isPending && deleteMutation.variables === type.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No se encontraron tipos de tarea. Comienza añadiendo uno nuevo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
