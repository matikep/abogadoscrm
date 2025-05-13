// src/app/dashboard/calendar/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Info, CalendarCheck2, Scale } from 'lucide-react'; // Added specific icons
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

// Placeholder event type
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'Audiencia' | 'Juicio';
  description?: string;
  time?: string; // e.g., "10:00"
  caseLink?: string; // e.g., "/dashboard/cases/edit/case-id"
  location?: string; // e.g., "Sala 3, Juzgado Civil"
}

// Placeholder data - using a fixed year for simplicity
const currentYear = new Date().getFullYear();
const placeholderEvents: CalendarEvent[] = [
  { 
    id: '1', 
    title: 'Audiencia Caso Martinez vs. López', 
    date: new Date(currentYear, 6, 15), // July 15
    time: '10:00', 
    type: 'Audiencia', 
    description: 'Presentación de pruebas iniciales.',
    caseLink: '/dashboard/cases/edit/martinez-vs-lopez-id', // Example Link
    location: 'Juzgado Civil, Sala 2'
  },
  { 
    id: '2', 
    title: 'Juicio Sucesión Familia Gómez', 
    date: new Date(currentYear, 6, 22), // July 22
    time: '09:30', 
    type: 'Juicio', 
    description: 'Testimonios y alegatos finales.',
    location: 'Tribunal de Familia, Sala Principal'
  },
  { 
    id: '3', 
    title: 'Audiencia Preliminar Contrato Comercial', 
    date: new Date(currentYear, 6, 15), // July 15
    time: '14:00', 
    type: 'Audiencia',
    caseLink: '/dashboard/cases/edit/contrato-comercial-id',
    location: 'Corte de Apelaciones, Sala 1'
  },
  { 
    id: '4', 
    title: 'Audiencia Caso Constructora XYZ', 
    date: new Date(currentYear, 7, 5), // August 5
    time: '11:00', 
    type: 'Audiencia', 
    description: 'Discusión sobre medidas cautelares.',
    location: 'Juzgado de Garantía, Sala 3'
  },
   { 
    id: '5', 
    title: 'Juicio Laboral Sr. Acosta', 
    date: new Date(currentYear, 7, 12), // August 12
    time: '15:00', 
    type: 'Juicio', 
    description: 'Presentación de testigos clave.',
    caseLink: '/dashboard/cases/edit/sr-acosta-id',
    location: 'Juzgado Laboral, Sala A'
  },
];


export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return placeholderEvents
      .filter((event) => format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
      .sort((a, b) => (a.time && b.time ? a.time.localeCompare(b.time) : 0)); // Sort by time
  }, [selectedDate]);

  const eventDates = useMemo(() => placeholderEvents.map(event => event.date), []);

  const handleAddEvent = () => {
    // TODO: Implement add event functionality (e.g., open a dialog or navigate to a new page)
    alert('Funcionalidad para añadir evento no implementada aún.');
  };

  const getEventTypeIcon = (type: 'Audiencia' | 'Juicio') => {
    if (type === 'Audiencia') return <CalendarCheck2 className="h-4 w-4 mr-2 text-primary" />;
    if (type === 'Juicio') return <Scale className="h-4 w-4 mr-2 text-destructive" />;
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight animate-fadeInLeft">Calendario y Agenda</h2>
        <Button onClick={handleAddEvent} className="transition-all duration-150 ease-in-out active:scale-95 hover:shadow-lg animate-fadeInRight">
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Evento
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 animate-fadeInUp" data-delay="100">
          <Card className="shadow-xl transition-shadow duration-300 hover:shadow-2xl">
             <CardHeader>
                <CardTitle className="text-xl">Calendario</CardTitle>
             </CardHeader>
            <CardContent className="p-1 sm:p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md w-full"
                locale={es}
                modifiers={{ hasEvent: eventDates }}
                modifiersClassNames={{
                    hasEvent: 'border-2 border-primary rounded-full',
                }}
                footer={
                    <p className="text-xs text-muted-foreground p-2 text-center">
                        {selectedDate ? `Eventos para ${format(selectedDate, 'PPP', { locale: es })}.` : 'Selecciona una fecha.'}
                    </p>
                }
              />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 animate-fadeInUp" data-delay="200">
          <Card className="shadow-xl transition-shadow duration-300 hover:shadow-2xl min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-xl">
                Eventos para {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'Hoy'}
              </CardTitle>
              <CardDescription>Audiencias y juicios programados para la fecha seleccionada.</CardDescription>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length > 0 ? (
                <ul className="space-y-4">
                  {eventsForSelectedDate.map((event) => (
                    <li key={event.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card animate-fadeIn">
                      <div className="flex items-center mb-1">
                        {getEventTypeIcon(event.type)}
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                      </div>
                       <div className="flex items-center space-x-2 mb-2">
                         <Badge variant={event.type === 'Audiencia' ? 'default' : 'destructive'} className="text-xs">
                            {event.type}
                         </Badge>
                         {event.time && <Badge variant="outline" className="text-xs">Hora: {event.time}</Badge>}
                       </div>
                      {event.location && <p className="text-sm text-muted-foreground mb-1">Lugar: {event.location}</p>}
                      {event.description && <p className="text-sm mt-1 mb-2">{event.description}</p>}
                      {event.caseLink && (
                        <Button variant="link" size="sm" asChild className="p-0 h-auto">
                          <a href={event.caseLink} target="_blank" rel="noopener noreferrer">Ver Detalles del Caso</a>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center justify-center h-full">
                  <Info size={48} className="mx-auto mb-4 text-primary/50"/>
                  <p className="text-lg font-medium">No hay eventos programados.</p>
                  <p className="text-sm">Selecciona otra fecha o añade un nuevo evento.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
