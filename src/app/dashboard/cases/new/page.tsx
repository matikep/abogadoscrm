// src/app/dashboard/cases/new/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaseForm, CaseFormValues } from '@/components/case-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import NewCaseLoading from './loading'; // Assuming this exists or will be created if not
import { addCaseAction } from '../actions'; // Import Server Action

export default function NewCasePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: addCaseAction,
    onSuccess: (newCaseId) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({
        title: "Caso Creado",
        description: "El nuevo caso ha sido añadido exitosamente.",
        variant: "default", 
      });
      router.push('/dashboard/cases'); 
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo crear el caso: ${error.message}`,
        variant: "destructive",
      });
      console.error("Error adding case:", error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleFormSubmit = async (values: CaseFormValues) => {
    setIsSubmitting(true);
    mutation.mutate(values);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 animate-fadeIn">
      <h2 className="text-3xl font-bold tracking-tight">Añadir Nuevo Caso</h2>
      <CaseForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
