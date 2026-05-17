import { useQuery } from '@tanstack/react-query'
import { fetchParticipantsWithLocations } from '@/lib/api/participants'
import { POLLING_INTERVAL } from '@/constants'

export function useParticipants(appointmentId: string) {
  return useQuery({
    queryKey: ['participants', appointmentId],
    queryFn: () => fetchParticipantsWithLocations(appointmentId),
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false,
    staleTime: 0,
  })
}
