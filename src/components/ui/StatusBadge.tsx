import { useState, useEffect } from 'react'
import { cn } from '@/utils/cn'
import type { ParticipantStatus } from '@/types'

interface StatusBadgeProps {
  status: ParticipantStatus
  className?: string
}

const STATUS_CONFIG: Record<ParticipantStatus, { label: string; className: string }> = {
  on_time: { label: '정시', className: 'bg-emerald-50 text-status-on-time' },
  late: { label: '지각', className: 'bg-red-50 text-status-late' },
  arrived: { label: '도착', className: 'bg-blue-50 text-status-arrived' },
  unknown: { label: '미확인', className: 'bg-gray-100 text-status-unknown' },
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setAnimating(true)
    const t = setTimeout(() => setAnimating(false), 400)
    return () => clearTimeout(t)
  }, [status])

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        config.className,
        animating && 'animate-[shake-once_0.4s_ease-out]',
        className,
      )}
    >
      {config.label}
    </span>
  )
}
