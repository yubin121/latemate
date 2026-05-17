import { memo } from 'react'
import { Clock } from 'lucide-react'
import { formatHHMM } from '@/utils/formatTime'
import { cn } from '@/utils/cn'
import type { TimelineEventWithNickname } from '@/lib/api/timeline'
import type { TimelineEventType } from '@/types'

interface EventConfig {
  icon: string
  getText: (nickname: string | null) => string
  dotClass: string
  textClass?: string
}

const EVENT_CONFIG: Record<TimelineEventType, EventConfig> = {
  JOINED: {
    icon: '👋',
    getText: (n) => `${n ?? '알 수 없음'}이 참여했어요`,
    dotClass: 'bg-gray-300',
  },
  DEPARTED: {
    icon: '🏃',
    getText: (n) => `${n ?? '알 수 없음'}이 출발했어요`,
    dotClass: 'bg-brand-500',
  },
  ARRIVED: {
    icon: '🎉',
    getText: (n) => `${n ?? '알 수 없음'}이 도착했어요`,
    dotClass: 'bg-status-arrived',
  },
  LATE_ALERT: {
    icon: '⚠️',
    getText: (n) => `${n ?? '알 수 없음'}이 지각 예상이에요`,
    dotClass: 'bg-status-late',
    textClass: 'text-status-late',
  },
}

interface TimelineItemProps {
  event: TimelineEventWithNickname
  isLast: boolean
}

const TimelineItem = memo(function TimelineItem({ event, isLast }: TimelineItemProps) {
  const config = EVENT_CONFIG[event.event_type]

  return (
    <div className="flex gap-3">
      {/* 점 + 세로선 */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={cn('w-3 h-3 rounded-full mt-0.5 flex-shrink-0', config.dotClass)} />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-100 mt-1" />}
      </div>

      {/* 내용 */}
      <div className="pb-4 min-w-0">
        <p className={cn('text-sm font-medium text-gray-800', config.textClass)}>
          <span className="mr-1.5">{config.icon}</span>
          {config.getText(event.nickname)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 tabular-nums">
          {formatHHMM(new Date(event.occurred_at))}
        </p>
      </div>
    </div>
  )
})

function EmptyTimeline() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <Clock size={32} strokeWidth={1.5} className="text-gray-200" />
      <p className="text-sm font-medium text-gray-400">아직 이벤트가 없어요</p>
      <p className="text-xs text-gray-300 text-center">
        위치 공유를 시작하면 여기에 기록돼요
      </p>
    </div>
  )
}

interface TimelineProps {
  events: TimelineEventWithNickname[]
}

export default function Timeline({ events }: TimelineProps) {
  return (
    <div>
      <h2 className="text-sm font-bold text-gray-900 mb-3">타임라인</h2>

      {events.length === 0 ? (
        <EmptyTimeline />
      ) : (
        <div>
          {events.map((event, i) => (
            <TimelineItem key={event.id} event={event} isLast={i === events.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}
