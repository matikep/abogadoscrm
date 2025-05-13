// src/app/dashboard/tasks/page.tsx
'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { PlusCircle, List, Calendar as CalendarIconLucide, MoreHorizontal, Edit, Trash2, CheckSquare, Square, ExternalLink, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';
import TasksLoading from './loading';
import { fetchTasksAction, toggleTaskStatusAction, deleteTaskAction } from './actions'; // Import Server Actions

type ViewMode = 'list' | 'calendar';

function TasksPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const initialViewMode = (searchParams.get('view') as ViewMode) || 'list';
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: fetchTasksAction,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleTaskStatusAction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
       const task = tasks?.find(d => d.id === variables.id);
      if (task?.case_id) {
        queryClient.invalidateQueries({ queryKey: ['caseTasks', task.case_id] });
      }
      toast({ title: "Estado Actualizado", description: "El estado de la tarea ha sido actualizado." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: `No se pudo actualizar el estado: ${err.message}`, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTaskAction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      const task = tasks?.find(d => d.id === variables);
      if (task?.case_id) {
        queryClient.invalidateQueries({ queryKey: ['caseTasks', task.case_id] });
      }
      toast({ title: "Tarea Eliminada", description: "La tarea ha sido eliminada." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: `No se pudo eliminar la tarea: ${err.message}`, variant: "destructive" });
    },
  });
  
  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
    router.push(`/dashboard/tasks?view=${newMode}`, { scroll: false });
  };

  const handleAddTask = () => {
    router.push('/dashboard/tasks/new');
  };

  const handleEditTask = (id: string) => {
    router.push(`/dashboard/tasks/edit/${id}`);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleComplete = (id: string, currentStatus: TaskStatus) => {
    toggleStatusMutation.mutate({ id, currentStatus });
  };

  const getPriorityBadgeVariant = (priority: TaskPriority): "default" | "secondary" | "outline" | "destructive" => {
    switch (priority) {
      case 'Alta': return 'destructive';
      case 'Media': return 'default';
      case 'Baja': return 'secondary';
      default: return 'outline';
    }
  };
  
  const getStatusBadgeVariant = (status: TaskStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'Completada': return 'default';
      case 'Pendiente': return 'outline';
      default: return 'outline';
    }
  };


  const tasksForSelectedDate = useMemo(() => {
    if (viewMode !== 'calendar' || !selectedDate || !tasks) return [];
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
    return tasks.filter(d => format(d.due_date, 'yyyy-MM-dd') === formattedSelectedDate);
  }, [viewMode, selectedDate, tasks]);

  const tasksToDisplay = viewMode === 'list' ? tasks : tasksForSelectedDate;

  const renderTaskItem = (task: Task, itemKeyPrefix: string) => (
    <div
      key={`${itemKeyPrefix}-${task.id}`}
      className={cn(
        'flex items-start sm:items-center gap-3 p-3 rounded-lg border transition-all duration-150 ease-in-out group animate-fadeIn hover:shadow-lg',
        task.status === 'Completada' ? 'bg-muted/50 opacity-70' : 'bg-card hover:border-primary/50',
      )}
    >
      <Checkbox
        id={`${itemKeyPrefix}-task-${task.id}`}
        checked={task.status === 'Completada'}
        onCheckedChange={() => handleToggleComplete(task.id, task.status)}
        aria-label={`Marcar ${task.task_name} como ${task.status === 'Completada' ? 'pendiente' : 'completada'}`}
        className="transform scale-110 mt-1 sm:mt-0 flex-shrink-0 transition-transform hover:scale-125"
      />
      <div className="flex-1 grid gap-0.5">
        <label
          htmlFor={`${itemKeyPrefix}-task-${task.id}`}
          className={cn(
            'font-medium cursor-pointer group-hover:text-primary transition-colors',
            task.status === 'Completada' ? 'line-through text-muted-foreground' : 'text-card-foreground'
          )}
        >
          {task.task_name} <span className="text-xs text-muted-foreground">({task.type})</span>
        </label>
        <p className="text-xs text-muted-foreground">
          {task.start_date && <>Inicio: {format(task.start_date, 'P', { locale: es })} - </>}
          Vence: {format(task.due_date, 'PPP', { locale: es })}
        </p>
        {task.case_name && (
          <p className="text-xs text-muted-foreground">
            Caso: {' '}
            {task.case_id ? (
                <Link href={`/dashboard/cases/edit/${task.case_id}?tab=tasks`} className="text-primary hover:underline">
                    {task.case_name} <ExternalLink className="inline-block h-3 w-3 ml-1" />
                </Link>
            ) : (
                task.case_name
            )}
          </p>
        )}
        {task.description && viewMode === 'list' && (
             <p className="text-xs text-muted-foreground mt-1 truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all duration-200">
                {task.description}
            </p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
        <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs px-2 py-0.5">{task.priority}</Badge>
        <Badge variant={getStatusBadgeVariant(task.status)} className="text-xs px-2 py-0.5">{task.status}</Badge>
        {viewMode === 'list' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 transition-transform hover:scale-110">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-fadeInScale">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditTask(task.id)} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleComplete(task.id, task.status)} className="cursor-pointer">
                {task.status === 'Pendiente' ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                Marcar como {task.status === 'Pendiente' ? 'Completada' : 'Pendiente'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeleteTask(task.id)} 
                className="text-destructive cursor-pointer"
                disabled={deleteMutation.isPending && deleteMutation.variables === task.id}
              >
                {deleteMutation.isPending && deleteMutation.variables === task.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );

  if (isLoading) return <TasksLoading />;
  if (error) return <div className="p-4 sm:p-6">Error al cargar tareas: {(error as Error).message}</div>;

  return (
    <div className="space-y-6 p-4 sm:p-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight animate-fadeInLeft">Gestión de Tareas</h2>
        <div className="flex items-center gap-2 animate-fadeInRight">
          <Button variant={viewMode === 'list' ? "default" : "outline"} size="icon" onClick={() => handleViewModeChange('list')} aria-pressed={viewMode === 'list'} className="transition-all duration-150 ease-in-out hover:shadow-md active:scale-95">
            <List className="h-4 w-4" />
            <span className="sr-only">Vista de Lista</span>
          </Button>
          <Button variant={viewMode === 'calendar' ? "default" : "outline"} size="icon" onClick={() => handleViewModeChange('calendar')} aria-pressed={viewMode === 'calendar'} className="transition-all duration-150 ease-in-out hover:shadow-md active:scale-95">
            <CalendarIconLucide className="h-4 w-4" />
            <span className="sr-only">Vista de Calendario</span>
          </Button>
          <Button onClick={handleAddTask} className="transition-all duration-150 ease-in-out active:scale-95 hover:shadow-lg">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Tarea
          </Button>
        </div>
      </div>

      {viewMode === 'list' && (
        <Card className="shadow-xl transition-shadow duration-300 animate-fadeInUp">
          <CardHeader>
            <CardTitle>Lista de Tareas</CardTitle>
            <CardDescription>Todas las tareas pendientes y completadas, ordenadas por fecha de vencimiento.</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksToDisplay && tasksToDisplay.length > 0 ? (
              <div className="space-y-3">
                {tasksToDisplay.map((task) => renderTaskItem(task, 'list'))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-10">No hay tareas.</p>
            )}
          </CardContent>
        </Card>
      )}

      {viewMode === 'calendar' && (
        <div className="grid gap-6 md:grid-cols-3 animate-fadeInUp">
          <div className="md:col-span-1">
            <Card className="shadow-xl transition-shadow duration-300">
              <CardContent className="p-1 sm:p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md w-full"
                  locale={es}
                  modifiers={{
                    hasTask: tasks?.filter(d => d.status === 'Pendiente').map(d => d.due_date) || [],
                    isCompleted: tasks?.filter(d => d.status === 'Completada').map(d => d.due_date) || [],
                  }}
                  modifiersClassNames={{
                    hasTask: 'bg-destructive/20 text-destructive-foreground font-semibold rounded-full',
                    isCompleted: 'bg-primary/20 text-primary-foreground line-through rounded-full',
                  }}
                />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="shadow-xl transition-shadow duration-300 min-h-[300px]">
              <CardHeader>
                <CardTitle>
                  Tareas para {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'Hoy'}
                </CardTitle>
                <CardDescription>Tareas para la fecha seleccionada.</CardDescription>
              </CardHeader>
              <CardContent>
                {tasksForSelectedDate.length > 0 ? (
                  <div className="space-y-3">
                    {tasksForSelectedDate.map((task) => renderTaskItem(task, 'calendar'))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-10">No hay tareas para esta fecha.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<TasksLoading />}>
      <TasksPageContent />
    </Suspense>
  );
}
