import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createAppointment } from '@/lib/api/appointments'
import { createHostParticipant } from '@/lib/api/participants'
import { insertTimelineEvent } from '@/lib/api/timeline'
import { useSessionStore } from '@/stores/sessionStore'
import { useToast } from '@/hooks/useToast'
import type { CreateAppointmentInput } from '@/types'

const SESSION_KEY_STORAGE = 'latemate_session_key'

export function useCreateAppointment() {
  const navigate = useNavigate()
  const setSession = useSessionStore((s) => s.setSession)
  const toast = useToast()

  return useMutation({
    mutationFn: async (input: CreateAppointmentInput & { hostNickname: string }) => {
      const { hostNickname, ...appointmentInput } = input
      const appointment = await createAppointment(appointmentInput)
      const existing = localStorage.getItem(SESSION_KEY_STORAGE)
      const sessionKey = existing ?? crypto.randomUUID()
      if (!existing) localStorage.setItem(SESSION_KEY_STORAGE, sessionKey)
      const participant = await createHostParticipant(appointment.id, hostNickname, sessionKey)
      await insertTimelineEvent(appointment.id, 'JOINED', participant.id)
      return { appointment, participant, sessionKey }
    },
    onSuccess: ({ appointment, participant, sessionKey }) => {
      setSession({
        appointmentId: appointment.id,
        participantId: participant.id,
        sessionKey,
        nickname: participant.nickname,
        isHost: true,
      })
      navigate(`/appointment/${appointment.id}`, {
        state: { newlyCreated: true, inviteCode: appointment.invite_code },
      })
    },
    onError: () => {
      toast.error('약속 생성에 실패했어요. 다시 시도해주세요.')
    },
  })
}
