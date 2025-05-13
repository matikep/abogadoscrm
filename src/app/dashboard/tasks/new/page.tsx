// src/app/dashboard/tasks/new/page.tsx
'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TaskForm, type TaskFormValues } from '@/components/task-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import NewTaskLoading from './loading';
import { addTaskAction } from '../actions'; // Import Server Action

function NewTaskPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultCaseId = searchParams.get('caseId') || undefined;
  const defaultCaseName = searchParams.get('caseName') || undefined;
  const defaultStartDateISO = searchParams.get('startDate');
  const defaultStartDate = defaultStartDateISO ? new Date(defaultStartDateISO) : undefined;


  const mutation = useMutation({
    mutationFn: addTaskAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (defaultCaseId) {
        queryClient.invalidateQueries({ queryKey: ['caseTasks', defaultCaseId] });
      }
      toast({
        title: "Tarea Creada",
        description: "La nueva tarea ha sido añadida exitosamente.",
        variant: "default",
      });
      if (defaultCaseId) {
        router.push(`/dashboard/cases/edit/${defaultCaseId}?tab=tasks`);
      } else {
        router.push('/dashboard/tasks');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo crear la tarea: ${error.message}`,
        variant: "destructive",
      });
      console.error("Error adding task:", error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleFormSubmit = async (values: TaskFormValues & { caseName?: string }) => {
    setIsSubmitting(true);
    const submissionValues = {
        ...values,
        case_name: values.caseName, 
    };
    mutation.mutate(submissionValues);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 animate-fadeIn">
      <h2 className="text-3xl font-bold tracking-tight">Añadir Nueva Tarea {defaultCaseName ? `para ${defaultCaseName}` : ''}</h2>
      <TaskForm
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        defaultCaseId={defaultCaseId}
        defaultCaseName={defaultCaseName}
        defaultStartDate={defaultStartDate}
      />
    </div>
  );
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={<NewTaskLoading />}>
      <NewTaskPageContent />
    </Suspense>
  );
}
