import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { joinAppointment } from '@/lib/api/participants'
import { insertTimelineEvent } from '@/lib/api/timeline'
import { useSessionStore } from '@/stores/sessionStore'

const SESSION_KEY_STORAGE = 'latemate_session_key'

function getOrCreateSessionKey(): string {
  const existing = localStorage.getItem(SESSION_KEY_STORAGE)
  if (existing) return existing
  const key = crypto.randomUUID()
  localStorage.setItem(SESSION_KEY_STORAGE, key)
  return key
}

export function useJoinAppointment(appointmentId: string) {
  const navigate = useNavigate()
  const setSession = useSessionStore((s) => s.setSession)

  return useMutation({
    mutationFn: async (nickname: string) => {
      const sessionKey = getOrCreateSessionKey()
      const participant = await joinAppointment({ appointmentId, nickname, sessionKey })
      await insertTimelineEvent(appointmentId, 'JOINED', participant.id)
      return { participant, sessionKey }
    },
    onSuccess: ({ participant, sessionKey }) => {
      setSession({
        appointmentId,
        participantId: participant.id,
        sessionKey,
        nickname: participant.nickname,
        isHost: participant.is_host,
      })
      navigate(`/appointment/${appointmentId}`)
    },
  })
}
