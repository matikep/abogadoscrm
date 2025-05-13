import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function NewCaseLoading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Skeleton className="h-8 w-64" /> {/* Title Skeleton */}

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

        {/* Submit Button Skeleton */}
        <Button disabled>
          Creando Caso...
        </Button>
      </div>
    </div>
  );
}
