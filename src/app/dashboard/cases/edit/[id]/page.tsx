// src/app/dashboard/cases/edit/[id]/page.tsx
'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CaseForm, type CaseFormValues } from '@/components/case-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Removed direct db import
import { storage } from '@/lib/firebase'; // Firebase Storage for file operations
import { useToast } from '@/hooks/use-toast';
import EditCaseLoading from './loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, Trash2, CheckSquare, Square, ExternalLink, ReceiptText, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Case, CasePaymentStatus } from '@/types/case';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';
import type { BillableItem } from '@/types/billable-item';
import type { CaseBillingItem } from '@/types/case-billing-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  fetchCaseAction,
  updateCaseDetailsAction,
  fetchCaseTasksAction,
  toggleTaskStatusAction,
  deleteTaskAction,
  fetchGenericBillableItemsAction,
  fetchCaseBillingItemsAction,
  addBillingItemToCaseAction,
  deleteCaseBillingItemAction,
  updateTotalBilledForCaseAction,
} from './actions'; // Import Server Actions

// Type for data fetched from PostgreSQL, matching Case type but with JS Dates
interface CaseDataFromDB extends Case {
  total_billed_calculated?: number; 
}


function CaseTasksTabContent({ caseData }: { caseData: CaseDataFromDB }) { 
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = useQuery<Task[]>({ 
    queryKey: ['caseTasks', caseData.id], 
    queryFn: () => fetchCaseTasksAction(caseData.id), 
    enabled: !!caseData.id,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleTaskStatusAction, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseTasks', caseData.id] }); 
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); 
      toast({ title: "Estado Actualizado", description: "El estado de la tarea ha sido actualizado." });
    },
    onError: (err: any) => toast({ title: "Error", description: `No se pudo actualizar el estado: ${err.message}`, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTaskAction, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseTasks', caseData.id] }); 
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); 
      toast({ title: "Tarea Eliminada", description: "La tarea ha sido eliminada." });
    },
    onError: (err: any) => toast({ title: "Error", description: `No se pudo eliminar la tarea: ${err.message}`, variant: "destructive" }),
  });

  const handleEditTask = (taskId: string) => { 
    router.push(`/dashboard/tasks/edit/${taskId}`); 
  };

  const handleDeleteTask = (taskId: string) => { 
    if (confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
      deleteMutation.mutate(taskId);
    }
  };
  
  const handleAddNewTask = () => { 
    const latestTask = tasks && tasks.length > 0 ? tasks.sort((a,b) => b.due_date.getTime() - a.due_date.getTime())[0] : null;
    const defaultStartDate = latestTask?.due_date ? new Date(new Date(latestTask.due_date).setDate(new Date(latestTask.due_date).getDate() + 1)) : new Date();
    router.push(`/dashboard/tasks/new?caseId=${caseData.id}&caseName=${encodeURIComponent(caseData.case_number + ' - ' + caseData.client_name)}&startDate=${defaultStartDate.toISOString()}`); 
  };

  const getPriorityBadgeVariant = (priority: TaskPriority) => ({ Alta: 'destructive', Media: 'default', Baja: 'secondary' }[priority] || 'outline') as any;
  const getStatusBadgeVariant = (status: TaskStatus) => ({ Completada: 'default', Pendiente: 'outline' }[status] || 'outline') as any;

  if (isLoadingTasks) return ( 
    <div className="space-y-4 mt-6">
      {Array.from({length: 3}).map((_,i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
          <Skeleton className="h-5 w-5 rounded-sm" />
          <div className="flex-1 grid gap-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
  if (tasksError) return <div>Error cargando tareas: {(tasksError as Error).message}</div>; 

  return (
    <div className="space-y-4 mt-6">
       <Button onClick={handleAddNewTask} className="w-full sm:w-auto transition-all duration-150 ease-in-out active:scale-95 hover:shadow-lg">
        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nueva Tarea para este Caso
      </Button>
      {tasks && tasks.length > 0 ? ( 
        tasks.map((task) => ( 
          <div
            key={task.id}
            className={cn(
              'flex items-start sm:items-center gap-3 p-3 rounded-lg border transition-all duration-150 ease-in-out group hover:shadow-lg',
              task.status === 'Completada' ? 'bg-muted/50 opacity-70' : 'bg-card hover:border-primary/50',
              'animate-fadeIn'
            )}
          >
            <Checkbox
              id={`case-task-${task.id}`}
              checked={task.status === 'Completada'}
              onCheckedChange={() => toggleStatusMutation.mutate({id: task.id, currentStatus: task.status})}
              className="transform scale-110 mt-1 sm:mt-0 flex-shrink-0 transition-transform hover:scale-125"
            />
            <div className="flex-1 grid gap-0.5">
              <label
                htmlFor={`case-task-${task.id}`}
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
              {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all duration-200">
                      {task.description}
                  </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs px-2 py-0.5">{task.priority}</Badge>
                <Badge variant={getStatusBadgeVariant(task.status)} className="text-xs px-2 py-0.5">{task.status}</Badge>
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
                    <DropdownMenuItem onClick={() => toggleStatusMutation.mutate({ id: task.id, currentStatus: task.status })} className="cursor-pointer">
                        {task.status === 'Pendiente' ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                        Marcar como {task.status === 'Pendiente' ? 'Completada' : 'Pendiente'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteTask(task.id)} 
                      className="text-destructive cursor-pointer"
                      disabled={deleteMutation.isPending && deleteMutation.variables === task.id}
                    >
                      {deleteMutation.isPending && deleteMutation.variables === task.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                      Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-10">No hay tareas asociadas a este caso.</p>
      )}
    </div>
  );
}

function CaseBillingTabContent({ caseData }: { caseData: CaseDataFromDB }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddBillingItemOpen, setIsAddBillingItemOpen] = useState(false);
  const [selectedBillableItemId, setSelectedBillableItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addItemError, setAddItemError] = useState<string | null>(null);

  const { data: genericBillableItems, isLoading: isLoadingGenericItems } = useQuery<BillableItem[]>({
    queryKey: ['genericBillableItems'],
    queryFn: fetchGenericBillableItemsAction,
  });

  const { data: caseBillingItems, isLoading: isLoadingCaseItems, error: caseItemsError } = useQuery<CaseBillingItem[]>({
    queryKey: ['caseBillingItems', caseData.id],
    queryFn: () => fetchCaseBillingItemsAction(caseData.id),
    enabled: !!caseData.id,
  });

  const addBillingItemMutation = useMutation({
    mutationFn: addBillingItemToCaseAction,
    onSuccess: async () => {
      await updateTotalBilledForCaseAction(caseData.id); // This will refetch case and update total_billed
      queryClient.invalidateQueries({ queryKey: ['caseBillingItems', caseData.id] });
      queryClient.invalidateQueries({ queryKey: ['case', caseData.id] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({ title: "Ítem Agregado", description: "El ítem facturable ha sido agregado al caso." });
      setIsAddBillingItemOpen(false);
      setSelectedBillableItemId('');
      setQuantity(1);
      setAddItemError(null);
    },
    onError: (err: any) => {
      setAddItemError(`Error al agregar ítem: ${err.message}`);
      toast({ title: "Error", description: `No se pudo agregar el ítem: ${err.message}`, variant: "destructive" });
    },
  });
  
  const deleteCaseBillingItemMutation = useMutation({
    mutationFn: deleteCaseBillingItemAction,
    onSuccess: async () => {
      await updateTotalBilledForCaseAction(caseData.id);
      queryClient.invalidateQueries({ queryKey: ['caseBillingItems', caseData.id] });
      queryClient.invalidateQueries({ queryKey: ['case', caseData.id] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({ title: "Ítem Eliminado", description: "El ítem facturable ha sido eliminado del caso." });
    },
    onError: (err: any) => toast({ title: "Error", description: `No se pudo eliminar el ítem: ${err.message}`, variant: "destructive" }),
  });

  const handleAddBillableItemSubmit = () => {
    if (!selectedBillableItemId) {
      setAddItemError("Por favor, selecciona un ítem facturable.");
      return;
    }
    if (quantity <= 0) {
      setAddItemError("La cantidad debe ser mayor a cero.");
      return;
    }
    const selectedItem = genericBillableItems?.find(item => item.id === selectedBillableItemId);
    if (!selectedItem) {
      setAddItemError("Ítem facturable seleccionado no es válido.");
      return;
    }
    addBillingItemMutation.mutate({
      caseId: caseData.id,
      billableItemId: selectedItem.id,
      name: selectedItem.name,
      priceAtTimeOfBilling: selectedItem.price,
      quantity: quantity,
    });
  };

  const handleDeleteCaseBillingItem = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este ítem facturable del caso?")) {
      deleteCaseBillingItemMutation.mutate(id);
    }
  };
  
  const paymentStatusDisplay: Record<CasePaymentStatus, string> = {
    'Pendiente de Facturación': 'Pendiente',
    'Facturado - Pendiente de Pago': 'Facturado',
    'Abono Realizado': 'Abonado',
    'Pagado Completo': 'Pagado',
    'Anulado': 'Anulado',
  };

  if (isLoadingCaseItems) return <div className="mt-6 space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-20 w-full" /></div>;
  if (caseItemsError) return <div className="mt-6 text-destructive">Error cargando ítems facturables: {(caseItemsError as Error).message}</div>;

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen de Facturación</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
                <Label className="text-muted-foreground">Total Facturado</Label>
                <p className="font-semibold text-xl">${caseData.total_billed?.toFixed(2) ?? '0.00'}</p>
            </div>
            <div>
                <Label className="text-muted-foreground">Monto Pagado</Label>
                <p className="font-semibold text-xl text-green-600">${caseData.amount_paid?.toFixed(2) ?? '0.00'}</p>
            </div>
            <div>
                <Label className="text-muted-foreground">Estado del Pago</Label>
                 <Badge variant={caseData.payment_status === 'Pagado Completo' ? 'default' : (caseData.payment_status === 'Anulado' ? 'destructive': 'outline')} className="text-base">
                   {caseData.payment_status ? paymentStatusDisplay[caseData.payment_status] : 'No definido'}
                </Badge>
            </div>
        </CardContent>
      </Card>
      
      <Dialog open={isAddBillingItemOpen} onOpenChange={setIsAddBillingItemOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto transition-all duration-150 ease-in-out active:scale-95 hover:shadow-lg">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Ítem Facturable al Caso
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir Ítem Facturable</DialogTitle>
            <DialogDescription>Selecciona un ítem de la lista de tarifas y especifica la cantidad.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="billable-item-select">Ítem Facturable</Label>
              <Select value={selectedBillableItemId} onValueChange={setSelectedBillableItemId} disabled={isLoadingGenericItems}>
                <SelectTrigger id="billable-item-select">
                  <SelectValue placeholder={isLoadingGenericItems ? "Cargando tarifas..." : "Selecciona una tarifa/servicio"} />
                </SelectTrigger>
                <SelectContent>
                  {genericBillableItems?.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name} (${item.price.toFixed(2)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity-input">Cantidad</Label>
              <Input 
                id="quantity-input" 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)) || 1)} 
                min="1"
              />
            </div>
            {addItemError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{addItemError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBillingItemOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddBillableItemSubmit} disabled={addBillingItemMutation.isPending || isLoadingGenericItems}>
              {addBillingItemMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Añadir Ítem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {caseBillingItems && caseBillingItems.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Ítem</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Agregado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caseBillingItems.map(item => (
                <TableRow key={item.id} className="animate-fadeIn">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">${item.price_at_time_of_billing.toFixed(2)}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right font-semibold">${item.total.toFixed(2)}</TableCell>
                  <TableCell>{format(item.created_at, 'P', { locale: es })}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteCaseBillingItem(item.id)} 
                      disabled={deleteCaseBillingItemMutation.isPending && deleteCaseBillingItemMutation.variables === item.id}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      {deleteCaseBillingItemMutation.isPending && deleteCaseBillingItemMutation.variables === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10">No hay ítems facturables asociados a este caso.</p>
      )}
    </div>
  );
}


function EditCasePageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const caseId = params.id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);

  const activeTab = searchParams.get('tab') || 'details';

  const { data: initialCaseData, isLoading: isLoadingCase, error: caseError, refetch: refetchCase } = useQuery<CaseDataFromDB | null>({
    queryKey: ['case', caseId],
    queryFn: () => fetchCaseAction(caseId),
    enabled: !!caseId,
  });

  const caseMutation = useMutation({
    mutationFn: updateCaseDetailsAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      toast({ title: "Caso Actualizado", description: "Los detalles del caso han sido actualizados." });
    },
    onError: (error: any) => toast({ title: "Error", description: `No se pudo actualizar el caso: ${error.message}`, variant: "destructive" }),
    onSettled: () => setIsSubmittingDetails(false),
  });

  const handleCaseFormSubmit = async (values: CaseFormValues) => {
    if (!caseId) return;
    setIsSubmittingDetails(true);
    const updatedData = {
      ...values,
      opening_date: values.openingDate || null, 
    };
    delete (updatedData as any).openingDate; 

    caseMutation.mutate({ id: caseId, values: updatedData });
  };
  

  if (isLoadingCase) return <EditCaseLoading />;
  if (caseError || !initialCaseData) return <div className="p-4 sm:p-6">Error al cargar el caso o el caso no existe. <Button onClick={() => refetchCase()}>Reintentar</Button></div>;

  const formInitialData: CaseFormValues & { id?: string; totalBilled?: number } = {
    id: initialCaseData.id,
    caseNumber: initialCaseData.case_number,
    clientName: initialCaseData.client_name,
    status: initialCaseData.status,
    type: initialCaseData.type,
    assignedLawyer: initialCaseData.assigned_lawyer,
    description: initialCaseData.description,
    openingDate: initialCaseData.opening_date,
    paymentStatus: initialCaseData.payment_status,
    amountPaid: initialCaseData.amount_paid,
    totalBilled: initialCaseData.total_billed,
  };
  

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn p-4 sm:p-6">
      <h2 className="text-3xl font-bold tracking-tight animate-fadeInLeft">
        Editar Caso: {initialCaseData.case_number} - {initialCaseData.client_name}
      </h2>

      <Tabs value={activeTab} onValueChange={(value) => router.push(`/dashboard/cases/edit/${caseId}?tab=${value}`)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 sm:max-w-lg">
          <TabsTrigger value="details" className="transition-colors duration-150">Detalles</TabsTrigger>
          <TabsTrigger value="tasks" className="transition-colors duration-150">Tareas</TabsTrigger> 
          <TabsTrigger value="billing" className="transition-colors duration-150 flex items-center gap-1.5">
            <ReceiptText className="h-4 w-4"/> Facturación
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-4 animate-fadeInUp">
          <CaseForm
            onSubmit={handleCaseFormSubmit}
            initialData={formInitialData}
            isSubmitting={isSubmittingDetails}
          />
        </TabsContent>
        <TabsContent value="tasks" className="mt-4 animate-fadeInUp"> 
          <CaseTasksTabContent caseData={initialCaseData} />
        </TabsContent>
        <TabsContent value="billing" className="mt-4 animate-fadeInUp">
          <CaseBillingTabContent caseData={initialCaseData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default function EditCasePage() {
  return (
    <Suspense fallback={<EditCaseLoading />}>
      <EditCasePageContent />
    </Suspense>
  );
}
