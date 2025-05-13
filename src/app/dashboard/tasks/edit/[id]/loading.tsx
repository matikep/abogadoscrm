import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function EditTaskLoading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 animate-pulse">
      <Skeleton className="h-8 w-64" /> {/* Title Skeleton */}

      <div className="space-y-8">
        {/* Form Fields Skeletons */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" /> {/* Label: Tipo de Tarea */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" /> {/* Label: Nombre Específico de la Tarea */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-36" /> {/* Label: Fecha de Inicio */}
                <Skeleton className="h-10 w-full" /> {/* Date Picker */}
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-40" /> {/* Label: Fecha de Vencimiento */}
                <Skeleton className="h-10 w-full" /> {/* Date Picker */}
            </div>
        </div>
         <div className="space-y-2">
          <Skeleton className="h-4 w-20" /> {/* Label: Prioridad */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
        </div>
         <div className="space-y-2">
          <Skeleton className="h-4 w-16" /> {/* Label: Estado */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" /> {/* Label: Asociar a Caso */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
        </div>
         <div className="space-y-2">
          <Skeleton className="h-4 w-40" /> {/* Label: Descripción */}
          <Skeleton className="h-24 w-full" /> {/* Textarea */}
        </div>

        {/* Submit Button Skeleton */}
        <Button disabled>
          Guardando Cambios...
        </Button>
      </div>
    </div>
  );
}
