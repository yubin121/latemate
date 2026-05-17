import { memo } from 'react'
import Avatar from '@/components/ui/Avatar'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatEtaMinutes } from '@/utils/formatTime'
import { cn } from '@/utils/cn'
import type { ParticipantWithLocation, ParticipantStatus } from '@/types'

interface ParticipantCardProps {
  participant: ParticipantWithLocation
  isMe?: boolean
}

const STATUS_BORDER: Record<ParticipantStatus, string> = {
  on_time: 'border-l-status-on-time',
  late: 'border-l-status-late',
  arrived: 'border-l-status-arrived',
  unknown: 'border-l-gray-200',
}

function ParticipantCard({ participant: p, isMe }: ParticipantCardProps) {
  const status: ParticipantStatus = (p.location?.status as ParticipantStatus) ?? 'unknown'
  const eta = p.location?.eta_seconds
  const isSharing = p.location?.is_sharing ?? false

  function getSubtext() {
    if (status === 'arrived') return '도착했어요 🎉'
    if (eta != null && isSharing) return `${formatEtaMinutes(eta)} 후 도착 예상`
    if (isSharing) return '위치 공유 중'
    return '위치 없음'
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 bg-white rounded-2xl shadow-card border-l-4 animate-[slide-up_0.25s_ease-out]',
        STATUS_BORDER[status],
      )}
    >
      <Avatar name={p.nickname} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate">{p.nickname}</span>
          {isMe && (
            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
              나
            </span>
          )}
          {p.is_host && (
            <span className="text-[10px] font-semibold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
              주최
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{getSubtext()}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  )
}

export default memo(ParticipantCard, (prev, next) =>
  prev.isMe === next.isMe &&
  prev.participant.id === next.participant.id &&
  prev.participant.nickname === next.participant.nickname &&
  prev.participant.is_host === next.participant.is_host &&
  prev.participant.location?.status === next.participant.location?.status &&
  prev.participant.location?.eta_seconds === next.participant.location?.eta_seconds &&
  prev.participant.location?.is_sharing === next.participant.location?.is_sharing,
)
