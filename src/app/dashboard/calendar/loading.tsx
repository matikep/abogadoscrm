import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function CalendarLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Skeleton className="h-8 w-64" /> {/* Title Skeleton: Calendario y Agenda */}
        <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Evento
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader><Skeleton className="h-6 w-32 mb-1" /></CardHeader> {/* Card Title: Calendario */}
            <CardContent className="p-1 sm:p-2">
              {/* Calendar Skeleton: Adjust height based on typical calendar size */}
              <Skeleton className="h-[300px] w-full rounded-md" /> 
              <Skeleton className="h-4 w-3/4 mt-2 mx-auto" /> {/* Footer text skeleton */}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="min-h-[400px]">
            <CardHeader>
              <Skeleton className="h-6 w-56 mb-1" /> {/* Card Title: Eventos para [Fecha] */}
              <Skeleton className="h-4 w-full max-w-md" /> {/* Card Description */}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Skeleton for multiple event items */}
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" /> {/* Icon Skeleton */}
                      <Skeleton className="h-5 w-3/4" /> {/* Event Title Skeleton */}
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-20 rounded-full" /> {/* Badge Skeleton */}
                        <Skeleton className="h-5 w-24 rounded-full" /> {/* Badge Skeleton */}
                    </div>
                    <Skeleton className="h-4 w-1/2" /> {/* Location Skeleton */}
                    <Skeleton className="h-4 w-full" /> {/* Description Skeleton */}
                    <Skeleton className="h-4 w-28 mt-1" /> {/* Button Link Skeleton */}
                  </div>
                ))}
                 {/* Or a no events message skeleton if it's more common initially */}
                {/* <div className="text-center py-10 flex flex-col items-center justify-center h-full">
                    <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-4 w-64 mx-auto mb-1" />
                    <Skeleton className="h-3 w-48 mx-auto" />
                </div> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
