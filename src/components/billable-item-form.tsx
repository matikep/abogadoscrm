// src/components/billable-item-form.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { BillableItem } from '@/types/billable-item';
import { Loader2 } from 'lucide-react';

const billableItemFormSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es obligatorio.' }).max(150, { message: 'El nombre no puede exceder los 150 caracteres.' }),
  price: z.coerce.number().positive({ message: 'El precio debe ser un número positivo.' }),
  description: z.string().max(500, {message: 'La descripción no puede exceder los 500 caracteres.'}).optional(),
});

export type BillableItemFormValues = z.infer<typeof billableItemFormSchema>;

interface BillableItemFormProps {
  onSubmit: (values: BillableItemFormValues) => Promise<void>;
  initialData?: Partial<BillableItem>;
  isSubmitting: boolean;
}

export function BillableItemForm({
  onSubmit,
  initialData,
  isSubmitting,
}: BillableItemFormProps) {
  const form = useForm<BillableItemFormValues>({
    resolver: zodResolver(billableItemFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      price: initialData?.price || 0,
      description: initialData?.description || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Tarifa/Servicio</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Consulta Legal, Redacción de Contrato" {...field} className="animate-fadeIn"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ej: 100.00" {...field} className="animate-fadeIn"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalles adicionales sobre la tarifa o servicio." {...field} className="animate-fadeIn resize-y min-h-[80px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto transition-all duration-150 ease-in-out active:scale-95 hover:shadow-lg">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (initialData?.id ? 'Guardar Cambios' : 'Crear Tarifa')}
        </Button>
      </form>
    </Form>
  );
}
