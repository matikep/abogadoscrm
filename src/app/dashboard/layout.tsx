import React, { Suspense } from 'react'; // Import Suspense
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { MainNav, type NavItem } from '@/components/main-nav'; // Import NavItem type
import { UserNav } from '@/components/user-nav';
import { BookText } from 'lucide-react'; // Keep BookText for logo, others handled in MainNav
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state

// Define a simple loading component
function DashboardContentLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-6 animate-pulse">
      <Skeleton className="h-8 w-48 mb-4" /> {/* Title Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl shadow-md" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
         {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl shadow-md" />)}
      </div>
    </div>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pass icon names as strings instead of component references
  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
    { href: '/dashboard/cases', label: 'Casos', iconName: 'Gavel' },
    { href: '/dashboard/clients', label: 'Clientes', iconName: 'Users' },
    { href: '/dashboard/tasks', label: 'Tareas', iconName: 'CalendarClock' },
    { href: '/dashboard/task-types', label: 'Tipos de Tarea', iconName: 'Tags' }, 
    { href: '/dashboard/billing/rates', label: 'Tarifas', iconName: 'ReceiptText' },
    { href: '/dashboard/documents', label: 'Documentos', iconName: 'Archive' },
    { href: '/dashboard/calendar', label: 'Calendario', iconName: 'CalendarDays' },
    { href: '/dashboard/settings', label: 'Configuración', iconName: 'Settings' },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
             <BookText className="h-6 w-6 text-primary" /> {/* Keep logo */}
             <h1 className="text-lg font-semibold">LexCase Manager</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <MainNav items={navItems} /> {/* Pass items with icon names */}
        </SidebarContent>
        <SidebarFooter className="p-2 border-t">
          {/* Footer content if needed */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen"> {/* Ensure full height */}
           <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6"> {/* Added backdrop blur for header */}
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                {/* Breadcrumbs or Title can go here */}
              </div>
              <UserNav />
           </header>
           <main className="flex-1 p-4 sm:p-6"> {/* Allow main content to grow and add padding */}
             {/* Wrap children with Suspense and provide a fallback */}
             <Suspense fallback={<DashboardContentLoading />}>
               {children}
             </Suspense>
           </main>
         </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

