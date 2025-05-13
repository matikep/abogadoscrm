import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" /> {/* Title Skeleton */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" /> {/* Card Title Skeleton */}
              <Skeleton className="h-4 w-4" /> {/* Icon Skeleton */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" /> {/* Main Number Skeleton */}
              <Skeleton className="h-3 w-32" /> {/* Subtext Skeleton */}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-36 mb-2" /> {/* Card Title Skeleton */}
              <Skeleton className="h-4 w-full max-w-xs" /> {/* Card Description Skeleton */}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
