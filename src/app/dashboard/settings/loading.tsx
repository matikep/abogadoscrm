import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-8 w-64" /> {/* Title: Configuración General */}

      {/* Tabs Skeleton */}
      <div className="w-full sm:w-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 rounded-md bg-muted p-1 sm:max-w-md">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>

      {/* Card Skeleton (simulating one tab's content) */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-1" /> {/* Card Title Skeleton */}
          <Skeleton className="h-4 w-full max-w-lg" /> {/* Card Description Skeleton */}
          <Skeleton className="h-4 w-5/6 mt-1" /> {/* Card Description Skeleton line 2 */}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" /> {/* Label Skeleton */}
            <Skeleton className="h-10 w-full max-w-md" /> {/* Input Skeleton */}
          </div>
          
          {/* Alert Skeleton */}
          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" /> {/* Icon Skeleton */}
                <Skeleton className="h-5 w-1/3" /> {/* Alert Title Skeleton */}
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled className="w-full sm:w-auto">
            <Skeleton className="h-4 w-24" /> {/* Button Text Skeleton */}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
