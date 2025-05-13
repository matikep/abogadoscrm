import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, List, Calendar as CalendarIconLucide } from "lucide-react";

export default function TasksLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <Skeleton className="h-8 w-72" /> {/* Title Skeleton */}
        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" disabled>
              <List className="h-4 w-4" />
           </Button>
           <Button variant="outline" size="icon" disabled>
             <CalendarIconLucide className="h-4 w-4" />
           </Button>
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Tarea
          </Button>
        </div>
      </div>

      {/* Simulating List View Loading */}
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" /> {/* Card Title Skeleton */}
          <Skeleton className="h-4 w-full max-w-lg" /> {/* Card Description Skeleton */}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
               <div key={index} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
                  <Skeleton className="h-5 w-5 rounded-sm" /> {/* Checkbox Skeleton */}
                  <div className="flex-1 grid gap-1">
                      <Skeleton className="h-4 w-3/4" /> {/* Title Skeleton */}
                      <Skeleton className="h-3 w-1/2" /> {/* Subtext Skeleton (Date, Case) */}
                      <Skeleton className="h-3 w-2/3 mt-1" /> {/* Subtext Skeleton (Description) */}
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" /> {/* Priority Badge Skeleton */}
                  <Skeleton className="h-8 w-8" /> {/* Actions Dropdown Skeleton */}
               </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
