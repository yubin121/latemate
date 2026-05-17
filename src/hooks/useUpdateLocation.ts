import { useMutation } from '@tanstack/react-query'
import { upsertParticipantLocation, updateLocationStatus } from '@/lib/api/locations'
import type { Coords, ParticipantStatus } from '@/types'

interface UpdateLocationArgs {
  participantId: string
  coords: Coords
  etaSeconds?: number
  status?: ParticipantStatus
}

export function useUpdateLocation() {
  return useMutation({
    mutationFn: ({ participantId, coords, etaSeconds, status }: UpdateLocationArgs) =>
      upsertParticipantLocation(participantId, coords, etaSeconds, status),
    retry: 1,
    // 에러 시 조용히 실패 — 다음 업로드에서 자동 재시도
    onError: () => {},
  })
}

interface UpdateStatusArgs {
  participantId: string
  etaSeconds: number
  status: ParticipantStatus
}

export function useUpdateStatus() {
  return useMutation({
    mutationFn: ({ participantId, etaSeconds, status }: UpdateStatusArgs) =>
      updateLocationStatus(participantId, etaSeconds, status),
    retry: 1,
    onError: () => {},
  })
}
