import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { formatCountdown, formatHHMM } from '@/utils/formatTime'
import type { Appointment } from '@/types'

interface AppointmentHeaderProps {
  appointment: Appointment
}

type CountdownState =
  | { type: 'past' }
  | { type: 'future'; label: string; timeStr: string }
  | { type: 'countdown'; value: string }

function getCountdownState(scheduledAt: string): CountdownState {
  const target = new Date(scheduledAt)
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()

  if (diffMs <= 0) return { type: 'past' }
  if (diffMs > 24 * 60 * 60 * 1000) {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate())
    const dayDiff = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000))
    const label = dayDiff === 1 ? '내일' : `${dayDiff}일 후`
    return { type: 'future', label, timeStr: formatHHMM(target) }
  }
  return { type: 'countdown', value: formatCountdown(target) }
}

export default function AppointmentHeader({ appointment }: AppointmentHeaderProps) {
  const [state, setState] = useState<CountdownState>(() =>
    getCountdownState(appointment.scheduled_at),
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setState(getCountdownState(appointment.scheduled_at))
    }, 1000)
    return () => clearInterval(timer)
  }, [appointment.scheduled_at])

  return (
    <header className="flex items-center h-14 px-4 bg-white border-b border-gray-100 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{appointment.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin size={11} strokeWidth={1.5} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-400 truncate">{appointment.place_name}</span>
        </div>
      </div>

      <div className="flex-shrink-0 ml-3 text-right">
        {state.type === 'past' && (
          <span className="text-xs text-gray-400">약속 시간이 지났어요</span>
        )}
        {state.type === 'future' && (
          <span className="text-xs font-semibold text-gray-500">
            {state.label} {state.timeStr}
          </span>
        )}
        {state.type === 'countdown' && (
          <span className="font-mono text-sm font-bold text-brand-600 tabular-nums">
            D-{state.value}
          </span>
        )}
      </div>
    </header>
  )
}
