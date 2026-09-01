import { useEffect, useRef } from 'react'
import { useLocationStore } from '@/stores/locationStore'
import { useUpdateStatus } from '@/hooks/useUpdateLocation'
import { fetchEtaSeconds } from '@/lib/api/kakaoDirections'
import { insertTimelineEvent } from '@/lib/api/timeline'
import { isWithinRadius } from '@/utils/distance'
import { ARRIVAL_RADIUS_M, ETA_INTERVAL, LATE_BUFFER_MS } from '@/constants'
import type { Coords, ParticipantStatus } from '@/types'

interface UseEtaOptions {
  participantId: string
  appointmentId: string
  destination: Coords
  scheduledAt: string
}

export function determineStatus(
  etaSeconds: number,
  scheduledAt: string,
  currentCoords: Coords,
  destination: Coords,
): ParticipantStatus {
  if (isWithinRadius(currentCoords, destination, ARRIVAL_RADIUS_M)) return 'arrived'

  const scheduledMs = new Date(scheduledAt).getTime()
  const etaArrivalMs = Date.now() + etaSeconds * 1000

  return etaArrivalMs > scheduledMs + LATE_BUFFER_MS ? 'late' : 'on_time'
}

export function useEta({ participantId, appointmentId, destination, scheduledAt }: UseEtaOptions) {
  const currentCoords = useLocationStore((s) => s.currentCoords)
  const isSharing = useLocationStore((s) => s.isSharing)
  const { mutate: updateStatus } = useUpdateStatus()

  const arrivedRef = useRef(false)        // ARRIVED 이벤트 중복 방지
  const lateAlertedRef = useRef(false)    // LATE_ALERT 이벤트 중복 방지
  const prevStatusRef = useRef<ParticipantStatus>('unknown')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function calculate(coords: Coords) {
    try {
      const etaSeconds = await fetchEtaSeconds(coords, destination)
      const status = determineStatus(etaSeconds, scheduledAt, coords, destination)

      updateStatus({ participantId, etaSeconds, status })

      // 도착 감지 (T-040)
      if (status === 'arrived' && !arrivedRef.current) {
        arrivedRef.current = true
        insertTimelineEvent(appointmentId, 'ARRIVED', participantId).catch(() => {})
      }

      // 지각 예상 전환 감지 (T-041)
      if (status === 'late' && prevStatusRef.current !== 'late' && !lateAlertedRef.current) {
        lateAlertedRef.current = true
        insertTimelineEvent(appointmentId, 'LATE_ALERT', participantId).catch(() => {})
      }

      prevStatusRef.current = status
    } catch {
      // API 오류 시 조용히 실패 — 이전 상태 유지
    }
  }

  useEffect(() => {
    if (!isSharing || !currentCoords) return

    // 즉시 1회 실행
    calculate(currentCoords)

    // 30초 interval
    intervalRef.current = setInterval(() => {
      const coords = useLocationStore.getState().currentCoords
      if (coords) calculate(coords)
    }, ETA_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // currentCoords가 변경될 때마다 interval 리셋 (새 위치로 즉시 재계산)
  }, [isSharing, currentCoords?.lat, currentCoords?.lng]) // eslint-disable-line react-hooks/exhaustive-deps
}
