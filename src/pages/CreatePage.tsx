import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PlaceSearch from '@/features/appointment/PlaceSearch'
import Button from '@/components/ui/Button'
import { useCreateAppointment } from '@/hooks/useCreateAppointment'
import { cn } from '@/utils/cn'

interface SelectedPlace {
  name: string
  lat: number
  lng: number
}

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function CreatePage() {
  const navigate = useNavigate()
  const { mutate: createAppointment, isPending } = useCreateAppointment()

  const [title, setTitle] = useState('')
  const [place, setPlace] = useState<SelectedPlace | null>(null)
  const [scheduledAt, setScheduledAt] = useState('')
  const [hostNickname, setHostNickname] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const minDatetime = toLocalDatetimeValue(new Date())

  function validate() {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = '약속 이름을 입력해주세요.'
    if (!place) e.place = '장소를 선택해주세요.'
    if (!scheduledAt) e.scheduledAt = '약속 시간을 입력해주세요.'
    else if (new Date(scheduledAt) <= new Date()) e.scheduledAt = '현재 시각 이후로 설정해주세요.'
    if (!hostNickname.trim()) e.hostNickname = '닉네임을 입력해주세요.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate() || !place) return
    createAppointment({
      title: title.trim(),
      place_name: place.name,
      place_lat: place.lat,
      place_lng: place.lng,
      scheduled_at: new Date(scheduledAt).toISOString(),
      hostNickname: hostNickname.trim(),
    })
  }

  return (
    <div className="flex flex-col min-h-dvh bg-surface-page">
      {/* 헤더 */}
      <header className="flex items-center h-14 px-4 bg-white border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 flex items-center justify-center -ml-2 text-gray-600"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <span className="text-base font-semibold text-gray-900 ml-1">새 약속 만들기</span>
      </header>

      {/* 폼 */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 pb-32">
        {/* 약속 이름 */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            약속 이름
          </label>
          <div className="relative">
            <input
              type="text"
              value={title}
              maxLength={50}
              placeholder="예: 강남역 치킨"
              onChange={(e) => setTitle(e.target.value)}
              className={cn(
                'h-12 px-4 w-full rounded-2xl border bg-gray-50 text-base outline-none transition-colors',
                'border-gray-200 placeholder:text-gray-400',
                'focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white',
                errors.title && 'border-status-late',
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 tabular-nums">
              {title.length}/50
            </span>
          </div>
          {errors.title && <p className="mt-1.5 text-xs text-status-late">{errors.title}</p>}
        </div>

        {/* 약속 장소 */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            약속 장소
          </label>
          <PlaceSearch value={place} onChange={setPlace} error={errors.place} />
        </div>

        {/* 약속 날짜 & 시간 */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            약속 날짜 & 시간
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            min={minDatetime}
            onChange={(e) => setScheduledAt(e.target.value)}
            className={cn(
              'h-12 px-4 w-full min-w-0 max-w-full rounded-2xl border bg-gray-50 text-base outline-none transition-colors',
              'border-gray-200',
              'focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white',
              errors.scheduledAt && 'border-status-late',
            )}
          />
          {errors.scheduledAt && (
            <p className="mt-1.5 text-xs text-status-late">{errors.scheduledAt}</p>
          )}
        </div>

        {/* 내 닉네임 */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            내 닉네임
          </label>
          <input
            type="text"
            value={hostNickname}
            maxLength={10}
            placeholder="약속 안에서 사용할 이름"
            onChange={(e) => setHostNickname(e.target.value)}
            className={cn(
              'h-12 px-4 w-full rounded-2xl border bg-gray-50 text-base outline-none transition-colors',
              'border-gray-200 placeholder:text-gray-400',
              'focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white',
              errors.hostNickname && 'border-status-late',
            )}
          />
          {errors.hostNickname && (
            <p className="mt-1.5 text-xs text-status-late">{errors.hostNickname}</p>
          )}
        </div>
      </div>

      {/* 하단 고정 CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] bg-white border-t border-gray-100">
        <Button size="lg" className="w-full" loading={isPending} onClick={handleSubmit}>
          약속 만들기 →
        </Button>
      </div>
    </div>
  )
}
