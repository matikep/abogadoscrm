// src/components/case-form.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea'; 
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; 
import { cn } from '@/lib/utils';
import type { CasePaymentStatus, Case as CaseType } from '@/types/case';

const casePaymentStatuses: CasePaymentStatus[] = [
  'Pendiente de Facturación',
  'Facturado - Pendiente de Pago',
  'Abono Realizado',
  'Pagado Completo',
  'Anulado'
];

// Zod schema for form values (camelCase)
const caseFormSchema = z.object({
  caseNumber: z.string().min(1, { message: 'El número de caso es obligatorio.' }),
  clientName: z.string().min(1, { message: 'El nombre del cliente es obligatorio.' }),
  type: z.string().min(1, { message: 'El tipo de caso es obligatorio.' }),
  status: z.enum(['Abierto', 'Cerrado', 'Pendiente', 'Archivado'], {
    required_error: 'El estado del caso es obligatorio.',
  }),
  assignedLawyer: z.string().min(1, { message: 'El abogado asignado es obligatorio.' }),
  description: z.string().optional(),
  openingDate: z.date().optional().nullable(), // Allow null for date
  paymentStatus: z.enum(casePaymentStatuses as [CasePaymentStatus, ...CasePaymentStatus[]], {
    required_error: 'El estado de pago es obligatorio.',
  }).optional(),
  amountPaid: z.coerce.number().nonnegative({ message: 'El monto pagado no puede ser negativo.' }).optional(),
}).refine(data => {
  if (data.paymentStatus === 'Abono Realizado' && (data.amountPaid === undefined || data.amountPaid <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'Si el estado es "Abono Realizado", el monto pagado debe ser mayor a cero.',
  path: ['amountPaid'],
});

export type CaseFormValues = z.infer<typeof caseFormSchema>;

// Props for the form component
interface CaseFormProps {
  onSubmit: (values: CaseFormValues, originalId?: string) => Promise<void>;
  initialData?: Partial<CaseType> & { id?: string; totalBilled?: number }; // Use CaseType which uses snake_case for backend fields
  isSubmitting: boolean;
}

export function CaseForm({ onSubmit, initialData, isSubmitting }: CaseFormProps) {
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      caseNumber: initialData?.case_number || '',
      clientName: initialData?.client_name || '',
      type: initialData?.type || '',
      status: initialData?.status || 'Abierto',
      assignedLawyer: initialData?.assigned_lawyer || '',
      description: initialData?.description || '',
      openingDate: initialData?.opening_date ? new Date(initialData.opening_date) : null,
      paymentStatus: initialData?.payment_status || 'Pendiente de Facturación',
      amountPaid: initialData?.amount_paid || 0,
    },
  });

  const handleSubmit = async (values: CaseFormValues) => {
    const submissionValues = {
      ...values,
      // Ensure amountPaid is 0 if not 'Abono Realizado' or 'Pagado Completo' (depends on how totalBilled is handled for Pagado Completo)
      amountPaid: values.paymentStatus === 'Abono Realizado' || values.paymentStatus === 'Pagado Completo' 
                    ? values.amountPaid 
                    : 0,
      openingDate: values.openingDate || null, // Pass null if undefined
    };
    await onSubmit(submissionValues, initialData?.id);
  };
  
  const watchedPaymentStatus = form.watch('paymentStatus');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="caseNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Caso</FormLabel>
              <FormControl>
                <Input placeholder="Ej: CS-2024-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Cliente</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Caso</FormLabel>
              <FormControl>
                 <Input placeholder="Ej: Litigio Civil, Penal, Contrato" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado del Caso</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Abierto">Abierto</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Cerrado">Cerrado</SelectItem>
                  <SelectItem value="Archivado">Archivado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="assignedLawyer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Abogado Asignado</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Dr. García" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="openingDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Apertura</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es }) 
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    locale={es} 
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción / Notas del Caso</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Añade detalles relevantes sobre el caso..."
                  className="resize-y min-h-[100px]" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado de Pago</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado de pago" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {casePaymentStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {(watchedPaymentStatus === 'Abono Realizado' || watchedPaymentStatus === 'Pagado Completo') && (
          <FormField
            control={form.control}
            name="amountPaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto Pagado/Abonado</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ej: 500.00" {...field} 
                   onChange={event => field.onChange(parseFloat(event.target.value) || 0)}
                  />
                </FormControl>
                {watchedPaymentStatus === 'Pagado Completo' && initialData?.totalBilled !== undefined && (
                    <FormDescription>
                        Total facturado para este caso: ${initialData.totalBilled.toFixed(2)}. 
                        Asegúrate que el monto pagado coincida si el estado es "Pagado Completo".
                    </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isSubmitting} className="transition-all duration-150 ease-in-out active:scale-95 hover:shadow-lg">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : (initialData?.id ? 'Guardar Cambios del Caso' : 'Crear Caso')}
        </Button>
      </form>
    </Form>
  );
}
