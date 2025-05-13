'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, User, Phone, Mail } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ClientsLoading from './loading'; // Import the loading component

// Placeholder data - replace with actual data fetching and state management
const clients = [
  { id: '1', name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '+34 600 11 22 33', cases: 2, status: 'Activo' },
  { id: '2', name: 'Empresa Alfa S.L.', email: 'contacto@alfa.com', phone: '+34 91 234 56 78', cases: 5, status: 'Activo' },
  { id: '3', name: 'María García', email: 'maria.garcia@email.com', phone: '+34 655 99 88 77', cases: 1, status: 'Inactivo' },
  { id: '4', name: 'Carlos Rodríguez', email: 'c.rodriguez@consultores.es', phone: '+34 622 33 44 55', cases: 0, status: 'Potencial' },
  { id: '5', name: 'Luisa Fernández', email: 'l.fernandez@email.org', phone: '+34 677 88 99 00', cases: 3, status: 'Activo' },
];

// Simulate loading state - replace with actual isLoading from data fetching library
const isLoading = false; 

export default function ClientsPage() {

  const handleAddClient = () => {
    // TODO: Implement navigation or modal to add a new client
    console.log('Add new client');
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 0) return '??';
    if (names.length === 1) return names[0][0]?.toUpperCase() || '??';
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'Activo': return 'default';
      case 'Inactivo': return 'secondary';
      case 'Potencial': return 'outline'; 
      default: return 'outline';
    }
  };

  if (isLoading) return <ClientsLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h2>
        <Button onClick={handleAddClient} className="transition-all duration-150 ease-in-out active:scale-95">
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Cliente
        </Button>
      </div>

       <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Gestiona la información de contacto y los casos asociados a tus clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border shadow-sm">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[60px] sm:w-[80px] p-2 sm:p-4">Avatar</TableHead>
                    <TableHead className="p-2 sm:p-4">Nombre</TableHead>
                    <TableHead className="hidden md:table-cell p-2 sm:p-4">Email</TableHead>
                    <TableHead className="hidden sm:table-cell p-2 sm:p-4">Teléfono</TableHead>
                    <TableHead className="text-center p-2 sm:p-4">Casos</TableHead>
                     <TableHead className="p-2 sm:p-4">Estado</TableHead>
                    <TableHead className="text-right p-2 sm:p-4">
                    <span className="sr-only">Acciones</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {clients.length > 0 ? (
                    clients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-muted/50 transition-colors duration-150">
                         <TableCell className="p-2 sm:p-4">
                            <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                                <AvatarImage 
                                  src={`https://picsum.photos/seed/${client.id}/40/40`} 
                                  alt={client.name} 
                                  data-ai-hint="person avatar"
                                  className="transition-opacity duration-300 hover:opacity-80"
                                />
                                <AvatarFallback className="text-xs sm:text-sm">{getInitials(client.name)}</AvatarFallback>
                            </Avatar>
                         </TableCell>
                        <TableCell className="font-medium p-2 sm:p-4">{client.name}</TableCell>
                        <TableCell className="hidden md:table-cell p-2 sm:p-4">{client.email}</TableCell>
                        <TableCell className="hidden sm:table-cell p-2 sm:p-4">{client.phone}</TableCell>
                        <TableCell className="text-center p-2 sm:p-4">{client.cases}</TableCell>
                         <TableCell className="p-2 sm:p-4">
                            <Badge variant={getStatusBadgeVariant(client.status)} className="text-xs">{client.status}</Badge>
                         </TableCell>
                        <TableCell className="text-right p-2 sm:p-4">
                             <Button aria-haspopup="true" size="icon" variant="ghost" disabled className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Acciones</span>
                             </Button>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center p-4">
                        No se encontraron clientes. Comienza añadiendo uno nuevo.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
