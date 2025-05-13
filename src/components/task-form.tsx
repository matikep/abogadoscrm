// src/components/task-form.tsx
'use client';

import React, { useEffect, useState } from 'react';
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
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db'; // PostgreSQL utility
import type { TaskPriority, TaskStatus, Task as TaskDbType } from '@/types/task'; // TaskDbType for DB structure
import type { TaskType } from '@/types/task-type';
import type { Case } from '@/types/case';

const NO_CASE_SELECTED_VALUE = "__NO_CASE_SELECTED__";

// Zod schema for form values (camelCase)
const taskFormSchemaBase = z.object({
  taskName: z.string().min(1, { message: 'El nombre específico de la tarea es obligatorio.' }),
  type: z.string().min(1, { message: 'El tipo de tarea es obligatorio.' }),
  startDate: z.date().optional().nullable(),
  dueDate: z.date({ required_error: 'La fecha de vencimiento es obligatoria.' }),
  priority: z.enum(['Alta', 'Media', 'Baja'] as [TaskPriority, ...TaskPriority[]]),
  status: z.enum(['Pendiente', 'Completada'] as [TaskStatus, ...TaskStatus[]]),
  caseId: z.string().optional(), // Stays as string for form, converted to int for DB
  description: z.string().optional(),
});

const taskFormSchema = taskFormSchemaBase.refine(
  (data) => {
    if (data.startDate && data.dueDate) {
      return data.dueDate >= data.startDate;
    }
    return true;
  },
  {
    message: 'La fecha de vencimiento no puede ser anterior a la fecha de inicio.',
    path: ['dueDate'], 
  }
);

export type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onSubmit: (values: TaskFormValues & { caseName?: string }, originalId?: string) => Promise<void>;
  // initialData uses camelCase for form fields, matching TaskFormValues.
  // It might also contain original DB field names if needed for logic, but form itself uses camelCase.
  initialData?: Partial<TaskFormValues & { id?: string; caseName?: string; startDate?: Date; dueDate?: Date }>;
  isSubmitting: boolean;
  defaultCaseId?: string;
  defaultCaseName?: string;
  defaultStartDate?: Date;
}

export function TaskForm({
  onSubmit,
  initialData,
  isSubmitting,
  defaultCaseId,
  defaultCaseName,
  defaultStartDate,
}: TaskFormProps) {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isLoadingCases, setIsLoadingCases] = useState(true);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      taskName: initialData?.taskName || '',
      type: initialData?.type || '',
      startDate: initialData?.startDate || defaultStartDate || null,
      dueDate: initialData?.dueDate || (defaultStartDate ? addDays(defaultStartDate, 7) : new Date()),
      priority: initialData?.priority || 'Media',
      status: initialData?.status || 'Pendiente',
      caseId: initialData?.caseId || defaultCaseId || NO_CASE_SELECTED_VALUE,
      description: initialData?.description || '',
    },
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setIsLoadingTypes(true);
        const typesResult = await db.query("SELECT id, name FROM task_types ORDER BY name ASC");
        setTaskTypes(typesResult.rows.map(r => ({...r, id: r.id.toString()} as TaskType)));
      } catch (error) {
        console.error("Error fetching task types:", error);
      } finally {
        setIsLoadingTypes(false);
      }

      try {
        setIsLoadingCases(true);
        const casesResult = await db.query("SELECT id, case_number, client_name FROM cases ORDER BY case_number ASC");
        setCases(casesResult.rows.map(r => ({...r, id: r.id.toString()} as Case)));
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setIsLoadingCases(false);
      }
    };
    fetchDropdownData();
  }, []);
  
  useEffect(() => {
    if (defaultCaseId && defaultCaseId !== NO_CASE_SELECTED_VALUE) {
      form.setValue('caseId', defaultCaseId);
    }
    if (defaultStartDate) {
        form.setValue('startDate', defaultStartDate);
        if (!initialData?.dueDate) { // Only set dueDate if not already set by initialData
            form.setValue('dueDate', addDays(defaultStartDate, 7));
        }
    }
  }, [defaultCaseId, defaultStartDate, form, initialData?.dueDate]);


  const handleSubmit = async (values: TaskFormValues) => {
    const finalCaseId = values.caseId === NO_CASE_SELECTED_VALUE ? undefined : values.caseId;
    const selectedCase = cases.find(c => c.id === finalCaseId);
    
    const submissionValues = { 
      ...values, 
      caseId: finalCaseId, // caseId here is string or undefined
      caseName: selectedCase?.case_number ? `${selectedCase.case_number} - ${selectedCase.client_name}` : undefined 
    };
    await onSubmit(submissionValues, initialData?.id);
  };
  
  const selectedCaseId = form.watch('caseId');

  useEffect(() => {
    const setDefaultStartDateBasedOnCase = async () => {
      if (selectedCaseId && selectedCaseId !== NO_CASE_SELECTED_VALUE && !initialData?.startDate && !defaultStartDate) {
        // Fetch latest task for the selected case to suggest next start date
        try {
          const qResult = await db.query(
            'SELECT due_date FROM tasks WHERE case_id = $1 ORDER BY due_date DESC LIMIT 1',
            [parseInt(selectedCaseId, 10)]
          );
          if (qResult.rows.length > 0) {
            const latestTaskDueDate = new Date(qResult.rows[0].due_date);
            const nextStartDate = addDays(latestTaskDueDate, 1);
            form.setValue('startDate', nextStartDate);
            if (!initialData?.dueDate) {
                 form.setValue('dueDate', addDays(nextStartDate, 7));
            }
          } else {
             form.setValue('startDate', new Date());
             if (!initialData?.dueDate) {
                form.setValue('dueDate', addDays(new Date(), 7));
             }
          }
        } catch (error) {
            console.error("Error fetching latest task for case:", error);
            form.setValue('startDate', new Date());
            if (!initialData?.dueDate) {
                form.setValue('dueDate', addDays(new Date(), 7));
            }
        }
      } else if ((!selectedCaseId || selectedCaseId === NO_CASE_SELECTED_VALUE) && !initialData?.startDate && !defaultStartDate) {
        form.setValue('startDate', new Date());
        if (!initialData?.dueDate) {
            form.setValue('dueDate', addDays(new Date(), 7));
        }
      }
    };
    // Only run this logic if not editing (no initialData.startDate) and no defaultStartDate is passed
    if (!initialData?.startDate && !defaultStartDate) {
        setDefaultStartDateBasedOnCase();
    }
  }, [selectedCaseId, initialData?.startDate, initialData?.dueDate, defaultStartDate, form]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Tarea</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingTypes}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingTypes ? "Cargando tipos..." : "Selecciona un tipo de tarea"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {taskTypes.map(tt => (
                    <SelectItem key={tt.id} value={tt.name}>{tt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taskName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Específico de la Tarea</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Preparar interrogatorio para Testigo A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Fecha de Inicio (Opcional)</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
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
            name="dueDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Fecha de Vencimiento</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                         className={cn(
                            "w-full pl-3 text-left font-normal",
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
                        disabled={(date) => {
                            const startDate = form.getValues("startDate");
                            return startDate ? date < startDate : false;
                          }}
                        initialFocus
                        locale={es}
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridad</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una prioridad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Baja">Baja</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Completada">Completada</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="caseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asociar a Caso (Opcional)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || NO_CASE_SELECTED_VALUE} 
                disabled={isLoadingCases}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingCases ? "Cargando casos..." : "Selecciona un caso"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_CASE_SELECTED_VALUE}>Ninguno</SelectItem>
                  {cases.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.case_number} - {c.client_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción / Notas (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Añade detalles adicionales sobre la tarea..."
                  className="resize-y min-h-[100px] focus:ring-primary focus:border-primary transition-shadow duration-150 ease-in-out animate-fadeIn"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || isLoadingTypes || isLoadingCases} className="transition-all duration-150 ease-in-out active:scale-95 w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (initialData?.id ? 'Guardar Cambios' : 'Crear Tarea')}
        </Button>
      </form>
    </Form>
  );
}
