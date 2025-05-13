// src/app/dashboard/tasks/edit/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TaskForm, type TaskFormValues } from '@/components/task-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/types/task';
import EditTaskLoading from './loading';
import { fetchTaskAction, updateTaskAction } from './actions'; // Import Server Actions

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: initialData, isLoading, error } = useQuery<Task | null>({
    queryKey: ['task', taskId],
    queryFn: () => fetchTaskAction(taskId),
    enabled: !!taskId,
  });

  const mutation = useMutation({
    mutationFn: updateTaskAction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      if (variables.values.caseId) { 
        queryClient.invalidateQueries({ queryKey: ['caseTasks', variables.values.caseId] });
      }
      toast({
        title: "Tarea Actualizada",
        description: "Los detalles de la tarea han sido actualizados.",
        variant: "default",
      });
      if (initialData?.case_id) {
         router.push(`/dashboard/cases/edit/${initialData.case_id}?tab=tasks`);
      } else {
        router.push('/dashboard/tasks');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la tarea: ${error.message}`,
        variant: "destructive",
      });
      console.error("Error updating task:", error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleFormSubmit = async (values: TaskFormValues & { caseName?: string }) => {
    if (!taskId) return;
    setIsSubmitting(true);
    const submissionValues = {
        ...values,
        case_name: values.caseName, 
    };
    mutation.mutate({ id: taskId, values: submissionValues });
  };

  if (isLoading) {
    return <EditTaskLoading />;
  }

  if (error || !initialData) {
    return <div className="p-4 sm:p-6">Error al cargar la tarea o no existe.</div>;
  }
  
  const formInitialData: TaskFormValues & { id?: string; caseName?: string; startDate?: Date; dueDate?: Date } = {
    id: initialData.id,
    taskName: initialData.task_name,
    type: initialData.type,
    startDate: initialData.start_date,
    dueDate: initialData.due_date,
    priority: initialData.priority,
    status: initialData.status,
    caseId: initialData.case_id,
    caseName: initialData.case_name, 
    description: initialData.description,
  };
  

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 animate-fadeIn">
      <h2 className="text-3xl font-bold tracking-tight">Editar Tarea</h2>
      <TaskForm
        onSubmit={handleFormSubmit}
        initialData={formInitialData}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
