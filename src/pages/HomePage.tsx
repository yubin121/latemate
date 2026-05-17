import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Plus } from 'lucide-react'
import { fetchAppointmentByCode } from '@/lib/api/appointments'
import Button from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'

export default function HomePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const isCodeValid = /^[A-Za-z0-9]{6}$/.test(code)

  async function handleJoinByCode() {
    if (!isCodeValid) return
    setLoading(true)
    try {
      const appointment = await fetchAppointmentByCode(code)
      navigate(`/join/${appointment.id}`)
    } catch {
      toast.error('존재하지 않는 초대 코드예요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh px-5 pt-20 pb-10 bg-surface-page">
      {/* 로고 */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
          <MapPin size={22} strokeWidth={2} className="text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900 tracking-tight">LateMate</span>
      </div>

      {/* 슬로건 */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">
          지각 걱정 없는<br />약속 공유
        </h1>
        <p className="text-sm text-gray-500">실시간 위치로 서로의 도착을 확인하세요</p>
      </div>

      {/* 약속 만들기 */}
      <Button
        size="lg"
        className="w-full mb-6"
        onClick={() => navigate('/create')}
      >
        <Plus size={18} strokeWidth={2} className="mr-2" />
        약속 만들기
      </Button>

      {/* 구분선 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 flex-shrink-0">또는 코드로 참여</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 코드 입력 */}
      <input
        type="text"
        value={code}
        maxLength={6}
        placeholder="초대 코드 6자리"
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && handleJoinByCode()}
        className="h-12 px-4 mb-3 w-full rounded-2xl border border-gray-200 bg-white text-center text-lg font-mono tracking-[0.3em] uppercase outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:tracking-normal placeholder:font-sans placeholder:text-base"
      />

      <Button
        variant="secondary"
        size="md"
        className="w-full"
        disabled={!isCodeValid}
        loading={loading}
        onClick={handleJoinByCode}
      >
        참여하기
      </Button>
    </div>
  )
}
