import { Navigation } from 'lucide-react'
import { useLocationStore } from '@/stores/locationStore'
import { useGeolocation } from '@/hooks/useGeolocation'
import { stopSharingLocation } from '@/lib/api/locations'
import { insertTimelineEvent } from '@/lib/api/timeline'
import LocationPermission from './LocationPermission'

interface LocationControlProps {
  participantId: string
  appointmentId: string
}

export default function LocationControl({ participantId, appointmentId }: LocationControlProps) {
  const { isSharing, error } = useLocationStore()
  const { startSharing, stopSharing } = useGeolocation({ participantId })

  async function handleStart() {
    // DEPARTED 타임라인 이벤트 기록 (T-043)
    insertTimelineEvent(appointmentId, 'DEPARTED', participantId).catch(() => {})
    startSharing()
  }

  async function handleStop() {
    stopSharing()
    try {
      await stopSharingLocation(participantId)
    } catch {
      // 조용히 실패
    }
  }

  if (error) {
    return <LocationPermission />
  }

  if (isSharing) {
    return (
      <button
        onClick={handleStop}
        className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 bg-emerald-50 border border-emerald-300 text-emerald-700 text-sm font-semibold transition-colors hover:bg-emerald-100"
      >
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-status-on-time animate-[live-pulse_2s_ease-in-out_infinite]" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-on-time" />
        </span>
        위치 공유 중
        <span className="text-emerald-400 mx-0.5">·</span>
        중지하기
      </button>
    )
  }

  return (
    <button
      onClick={handleStart}
      className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 bg-brand-600 text-white text-sm font-semibold shadow-card transition-colors hover:bg-brand-700 active:scale-95"
    >
      <Navigation size={18} strokeWidth={1.5} />
      위치 공유 시작하기 →
    </button>
  )
}
