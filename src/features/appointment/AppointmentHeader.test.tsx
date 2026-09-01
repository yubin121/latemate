import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getCountdownState } from './AppointmentHeader'

describe('getCountdownState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00+09:00'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('약속 시각이 과거면 { type: "past" }를 반환한다', () => {
    const state = getCountdownState('2026-01-15T11:59:00+09:00')
    expect(state).toEqual({ type: 'past' })
  })

  it('약속 시각이 현재와 정확히 같으면 { type: "past" } (<= 경계)', () => {
    const state = getCountdownState('2026-01-15T12:00:00+09:00')
    expect(state).toEqual({ type: 'past' })
  })

  it('12시간 뒤는 countdown 분기로 "12:00:00"을 반환한다', () => {
    const state = getCountdownState('2026-01-16T00:00:00+09:00')
    expect(state).toEqual({ type: 'countdown', value: '12:00:00' })
  })

  it('경계값: 정확히 24시간 뒤는 countdown 분기 (> 부등호이므로 future 아님)', () => {
    const state = getCountdownState('2026-01-16T12:00:00+09:00')
    expect(state.type).toBe('countdown')
    if (state.type === 'countdown') {
      expect(state.value).toBe('24:00:00')
    }
  })

  it('25시간 뒤 (다음 캘린더일 시각)는 future/"내일" 라벨을 반환한다', () => {
    const state = getCountdownState('2026-01-16T13:00:00+09:00')
    expect(state.type).toBe('future')
    if (state.type === 'future') {
      expect(state.label).toBe('내일')
    }
  })

  it('T-062 회귀 방지: 3일 뒤는 "내일"이 아니라 "3일 후" 라벨을 반환한다', () => {
    const state = getCountdownState('2026-01-18T12:00:00+09:00')
    expect(state.type).toBe('future')
    if (state.type === 'future') {
      expect(state.label).toBe('3일 후')
    }
  })

  it('오전 10시 → 다음날 오전 9시 (diff=23h)는 countdown 분기 (달력 하루 차이지만 24h 미만)', () => {
    vi.setSystemTime(new Date('2026-01-15T10:00:00+09:00'))
    const state = getCountdownState('2026-01-16T09:00:00+09:00')
    expect(state.type).toBe('countdown')
  })
})
