import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function EditCaseLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
      <Skeleton className="h-8 w-3/4 mb-4" /> {/* Title Skeleton, wider for case number + client */}

      {/* Tabs Skeleton */}
      <div className="w-full sm:max-w-lg mb-6"> {/* Adjusted width for potentially 3 tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-md bg-muted p-1">
          <Skeleton className="h-9 w-full" /> {/* Details Tab */}
          <Skeleton className="h-9 w-full" /> {/* Tasks Tab */}
          <Skeleton className="h-9 w-full" /> {/* Billing Tab */}
        </div>
      </div>

      {/* Assuming Details Tab is shown by default */}
      <div className="space-y-8">
        {/* Form Fields Skeletons */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>
         <div className="space-y-2">
          <Skeleton className="h-4 w-16" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>
         <div className="space-y-2">
          <Skeleton className="h-4 w-32" /> {/* Label */}
           <Skeleton className="h-10 w-[240px]" /> {/* Date Picker Trigger */}
        </div>
         <div className="space-y-2">
          <Skeleton className="h-4 w-40" /> {/* Label */}
          <Skeleton className="h-24 w-full" /> {/* Textarea */}
        </div>
        {/* Billing specific fields in details tab skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" /> {/* Label: Estado de Pago */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" /> {/* Label: Monto Pagado */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>


        {/* Submit Button Skeleton */}
        <Button disabled>
          Guardando...
        </Button>
      </div>
      
      {/* Placeholder for Tasks/Billing Tab Loading can be added if needed, but details covers most */}
    </div>
  );
}
