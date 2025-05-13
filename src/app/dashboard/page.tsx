// src/app/dashboard/page.tsx
'use client'

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gavel, Users, CalendarClock, TrendingUp, AlertTriangle, BadgeDollarSign } from 'lucide-react';
import { BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useQuery } from '@tanstack/react-query';
import type { Case } from '@/types/case';
import type { Task } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DashboardLoading from './loading'; 
import { fetchCasesForDashboardAction, fetchTasksForDashboardAction } from './actions'; // Import Server Actions

const chartConfig = {
  ingresos: { label: "Ingresos", color: "hsl(var(--chart-1))" },
  gastos: { label: "Gastos", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;


export default function DashboardPage() {
  const { data: cases, isLoading: isLoadingCases, error: casesError } = useQuery<Case[]>({ 
    queryKey: ['allCasesForDashboard'], 
    queryFn: fetchCasesForDashboardAction 
  });
  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = useQuery<Task[]>({ 
    queryKey: ['allTasksForDashboard'], 
    queryFn: fetchTasksForDashboardAction 
  });

  const summaryData = useMemo(() => {
    if (!cases) return {
      activeCases: 0,
      clients: 0,
      totalBilled: 0,
      totalCollected: 0,
      pendingPayment: 0,
    };

    const activeCases = cases.filter(c => c.status === 'Abierto').length;
    const totalBilled = cases.reduce((sum, c) => sum + (c.total_billed || 0), 0);
    const totalCollected = cases.reduce((sum, c) => sum + (c.amount_paid || 0), 0);
    const pendingPayment = totalBilled - totalCollected;
    
    const clientNames = new Set(cases.map(c => c.client_name));

    return {
      activeCases,
      clients: clientNames.size,
      totalBilled,
      totalCollected,
      pendingPayment,
    };
  }, [cases]);
  
  const upcomingTasks = useMemo(() => {
    if (!tasks) return [];
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return tasks
        .filter(task => {
            const dueDateAsDate = new Date(task.due_date); 
            return task.status === 'Pendiente' && dueDateAsDate >= now && dueDateAsDate <= sevenDaysFromNow;
        })
        .sort((a,b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0,5);
  }, [tasks]);

  const recentCases = useMemo(() => {
    if (!cases) return [];
    return cases
        .sort((a,b) => {
            const aDate = (a.updated_at || a.created_at).getTime();
            const bDate = (b.updated_at || b.created_at).getTime();
            return bDate - aDate;
        })
        .slice(0,5);
  }, [cases]);


  // Placeholder billing data for chart
  const monthlyBillingData = [
    { month: "Ene", ingresos: 1860, gastos: 800 },
    { month: "Feb", ingresos: 3050, gastos: 1200 },
    { month: "Mar", ingresos: 2370, gastos: 900 },
    { month: "Abr", ingresos: 730, gastos: 500 },
    { month: "May", ingresos: 2090, gastos: 1100 },
    { month: "Jun", ingresos: 2140, gastos: 1300 },
  ];


  if (isLoadingCases || isLoadingTasks) {
    return <DashboardLoading />;
  }

  if (casesError) return <div className="p-6 text-center text-destructive">Error al cargar los casos: {(casesError as Error).message}</div>;
  if (tasksError) return <div className="p-6 text-center text-destructive">Error al cargar las tareas: {(tasksError as Error).message}</div>;


  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-1 animate-fadeInUp" data-delay="100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Activos</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.activeCases}</div>
            <p className="text-xs text-muted-foreground">
              Total de casos abiertos
            </p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-1 animate-fadeInUp" data-delay="150">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.clients}</div>
            <p className="text-xs text-muted-foreground">
              Clientes únicos registrados
            </p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-1 animate-fadeInUp" data-delay="200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryData.totalBilled.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Suma de todos los casos
            </p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-1 animate-fadeInUp" data-delay="250">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${summaryData.totalCollected.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">
              Monto total pagado
            </p>
          </CardContent>
        </Card>
         <Card className="transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-1 animate-fadeInUp" data-delay="300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente de Cobro</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">${summaryData.pendingPayment.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">
              Facturado menos recaudado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 transition-all duration-300 ease-in-out hover:shadow-lg animate-fadeInUp" data-delay="350">
            <CardHeader>
              <CardTitle>Rendimiento Financiero Mensual</CardTitle>
              <CardDescription>Comparativa de ingresos vs. gastos (datos de ejemplo).</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] sm:h-[350px] p-2 sm:p-4">
                 <ChartContainer config={chartConfig} className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyBillingData} accessibilityLayer>
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent indicator="dot" />} />
                            <Legend content={({payload}) => (
                                <div className="flex items-center justify-center gap-4 mt-2">
                                    {payload?.map((entry) => (
                                    <div key={entry.value} className="flex items-center gap-1.5 text-xs">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: entry.color}}></span>
                                        {entry.value && entry.value.charAt(0).toUpperCase() + entry.value.slice(1)}
                                    </div>
                                    ))}
                                </div>
                            )} />
                            <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={4} />
                            <Bar dataKey="gastos" fill="var(--color-gastos)" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
          </Card>
         <Card className="lg:col-span-3 transition-all duration-300 ease-in-out hover:shadow-lg animate-fadeInUp" data-delay="400">
            <CardHeader>
              <CardTitle>Tareas Próximas (7 días)</CardTitle>
               <CardDescription>Tareas y fechas límite importantes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.length > 0 ? upcomingTasks.map(task => (
                <Link href={`/dashboard/tasks/edit/${task.id}`} key={task.id} className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{task.task_name}</p>
                        <Badge variant={task.priority === "Alta" ? "destructive" : "outline"} className="text-xs">{task.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Vence: {format(task.due_date, 'PPP', {locale: es})}
                    </p>
                    {task.case_name && <p className="text-xs text-muted-foreground">Caso: {task.case_name}</p>}
                </Link>
              )) : (
                <p className="text-sm text-muted-foreground py-10 text-center">No hay tareas próximas en los siguientes 7 días.</p>
              )}
            </CardContent>
          </Card>
      </div>
      <Card className="transition-all duration-300 ease-in-out hover:shadow-lg animate-fadeInUp" data-delay="450">
        <CardHeader>
            <CardTitle>Casos Modificados Recientemente</CardTitle>
            <CardDescription>Últimos 5 casos con actividad reciente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            {recentCases.length > 0 ? recentCases.map(c => (
            <Link href={`/dashboard/cases/edit/${c.id}`} key={c.id} className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors animate-fadeIn">
                <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{c.case_number} - {c.client_name}</p>
                    <Badge variant="secondary" className="text-xs">{c.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Tipo: {c.type}</p>
                <p className="text-xs text-muted-foreground">
                    Última actualización: {format((c.updated_at || c.created_at), 'Pp', { locale: es })}
                </p>
            </Link>
            )) : (
            <p className="text-sm text-muted-foreground py-10 text-center">No hay casos recientes.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
