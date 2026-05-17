import { useQuery } from '@tanstack/react-query'
import { fetchAppointment } from '@/lib/api/appointments'

export function useAppointment(appointmentId: string) {
  return useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => fetchAppointment(appointmentId),
    staleTime: 60_000,
    retry: 1,
  })
}
