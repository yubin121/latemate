import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { determineStatus } from './useEta'
import type { Coords } from '@/types'

const destination: Coords = { lat: 37.5, lng: 127 }
const withinRadius: Coords = { lat: 37.5, lng: 127 } // 정확히 목적지 (0m)
const outsideRadius: Coords = { lat: 37.505, lng: 127 } // 약 555m (반경 100m 밖)

describe('determineStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00+09:00'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('목적지 반경(100m) 이내면 ETA가 아무리 지각이어도 "arrived"를 반환한다 (도착 판정이 최우선)', () => {
    const scheduledAt = '2026-01-01T12:10:00+09:00'
    expect(determineStatus(99999, scheduledAt, withinRadius, destination)).toBe('arrived')
  })

  it('반경 밖 + ETA가 약속 시각보다 여유 있으면 "on_time"', () => {
    const scheduledAt = '2026-01-01T12:10:00+09:00' // 10분 뒤 약속
    const etaSeconds = 300 // 5분 뒤 도착 → 5분 여유
    expect(determineStatus(etaSeconds, scheduledAt, outsideRadius, destination)).toBe('on_time')
  })

  it('경계값: ETA 도착 === 약속 시각 + 5분(LATE_BUFFER)이면 "on_time" (> 부등호이므로 같으면 late 아님)', () => {
    // now=12:00, scheduled=12:10, eta=15분 → 도착=12:15 === scheduled+buffer=12:15
    const scheduledAt = '2026-01-01T12:10:00+09:00'
    const etaSeconds = 15 * 60
    expect(determineStatus(etaSeconds, scheduledAt, outsideRadius, destination)).toBe('on_time')
  })

  it('경계값 +1ms: buffer를 넘어서면 "late" (>= 오구현 시 이 케이스가 실패)', () => {
    // scheduled을 1ms 앞으로 당겨 경계를 살짝 넘게 만듦
    const scheduledMs = new Date('2026-01-01T12:10:00+09:00').getTime() - 1
    const scheduledAt = new Date(scheduledMs).toISOString()
    const etaSeconds = 15 * 60
    expect(determineStatus(etaSeconds, scheduledAt, outsideRadius, destination)).toBe('late')
  })

  it('ETA가 약속보다 훨씬 이른 여유 도착이면 "on_time"', () => {
    const scheduledAt = '2026-01-01T13:00:00+09:00' // 1시간 뒤 약속
    const etaSeconds = 5 * 60 // 5분 뒤 도착 → 55분 일찍
    expect(determineStatus(etaSeconds, scheduledAt, outsideRadius, destination)).toBe('on_time')
  })

  it('반경 밖 + ETA가 약속 시각 + 30분이면 "late"', () => {
    const scheduledAt = '2026-01-01T12:10:00+09:00'
    const etaSeconds = 40 * 60 // 40분 뒤 도착 → 30분 지각
    expect(determineStatus(etaSeconds, scheduledAt, outsideRadius, destination)).toBe('late')
  })
})
