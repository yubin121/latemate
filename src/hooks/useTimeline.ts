import { useQuery } from '@tanstack/react-query'
import { fetchTimeline } from '@/lib/api/timeline'

export function useTimeline(appointmentId: string) {
  return useQuery({
    queryKey: ['timeline', appointmentId],
    queryFn: () => fetchTimeline(appointmentId),
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
    staleTime: 0,
  })
}
