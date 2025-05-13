// src/components/task-type-form.tsx
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
import type { TaskType } from '@/types/task-type';

const taskTypeFormSchema = z.object({
  name: z.string().min(1, { message: 'El nombre del tipo de tarea es obligatorio.' }).max(100, { message: 'El nombre no puede exceder los 100 caracteres.' }),
});

export type TaskTypeFormValues = z.infer<typeof taskTypeFormSchema>;

interface TaskTypeFormProps {
  onSubmit: (values: TaskTypeFormValues) => Promise<void>;
  initialData?: Partial<TaskType>;
  isSubmitting: boolean;
  submitButtonText?: string;
}

export function TaskTypeForm({
  onSubmit,
  initialData,
  isSubmitting,
  submitButtonText = initialData ? 'Guardar Cambios' : 'Crear Tipo de Tarea',
}: TaskTypeFormProps) {
  const form = useForm<TaskTypeFormValues>({
    resolver: zodResolver(taskTypeFormSchema),
    defaultValues: {
      name: initialData?.name || '',
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
              <FormLabel>Nombre del Tipo de Tarea</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Presentación de Demanda, Audiencia..." {...field} className="animate-fadeIn"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto transition-all duration-150 ease-in-out active:scale-95">
          {isSubmitting ? 'Guardando...' : submitButtonText}
        </Button>
      </form>
    </Form>
  );
}
