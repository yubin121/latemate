import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('bg-gray-200 rounded-lg animate-pulse', className)} />
}

export function JoinPageSkeleton() {
  return (
    <div className="flex flex-col min-h-dvh bg-surface-page px-4 pt-8">
      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-5">
        <div className="h-1 bg-gray-200" />
        <div className="p-5 space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-card space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  )
}

export function ParticipantListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-card">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-10 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function TimelineSkeletonList() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      ))}
    </div>
  )
}
