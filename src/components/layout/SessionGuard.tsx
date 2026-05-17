import { Navigate, useParams } from 'react-router-dom'
import { useSessionStore } from '@/stores/sessionStore'

interface SessionGuardProps {
  children: React.ReactNode
}

export default function SessionGuard({ children }: SessionGuardProps) {
  const { appointmentId } = useParams<{ appointmentId: string }>()
  const session = useSessionStore((s) => s.session)

  if (!session || session.appointmentId !== appointmentId) {
    return <Navigate to={`/join/${appointmentId}`} replace />
  }

  return <>{children}</>
}
