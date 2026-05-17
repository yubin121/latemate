import ParticipantCard from './ParticipantCard'
import type { ParticipantWithLocation, ParticipantStatus } from '@/types'

interface ParticipantListProps {
  participants: ParticipantWithLocation[]
  myParticipantId?: string
}

const STATUS_ORDER: Record<ParticipantStatus, number> = {
  arrived: 0,
  on_time: 1,
  late: 2,
  unknown: 3,
}

function sortParticipants(participants: ParticipantWithLocation[]): ParticipantWithLocation[] {
  return [...participants].sort((a, b) => {
    const statusA: ParticipantStatus = (a.location?.status as ParticipantStatus) ?? 'unknown'
    const statusB: ParticipantStatus = (b.location?.status as ParticipantStatus) ?? 'unknown'
    return STATUS_ORDER[statusA] - STATUS_ORDER[statusB]
  })
}

export default function ParticipantList({ participants, myParticipantId }: ParticipantListProps) {
  const sorted = sortParticipants(participants)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">
          참여자
          <span className="ml-1.5 text-brand-600">({participants.length})</span>
        </h2>
      </div>
      <div className="space-y-2">
        {sorted.map((p) => (
          <ParticipantCard key={p.id} participant={p} isMe={p.id === myParticipantId} />
        ))}
      </div>
    </div>
  )
}
