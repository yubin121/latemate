/** "HH:MM" 형식으로 변환 */
export function formatHHMM(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

/** 남은 시간을 "HH:MM:SS" 카운트다운 형식으로 변환 */
export function formatCountdown(targetDate: Date | string): string {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  const diffMs = target.getTime() - Date.now()

  if (diffMs <= 0) return '00:00:00'

  const totalSec = Math.floor(diffMs / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60

  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

/** 초(seconds)를 "N분" 또는 "N시간 N분" 형식으로 변환 */
export function formatEtaMinutes(seconds: number): string {
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `${minutes}분`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}
