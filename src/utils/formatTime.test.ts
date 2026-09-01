import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatHHMM, formatCountdown, formatEtaMinutes } from './formatTime'

describe('formatHHMM', () => {
  it('아침 시각은 zero-padded HH:MM으로 반환한다', () => {
    const d = new Date('2026-01-01T09:05:00+09:00')
    expect(formatHHMM(d)).toBe('09:05')
  })

  it('오후 시각은 24시간 표기로 반환한다 (hour12: false)', () => {
    const d = new Date('2026-01-01T23:00:00+09:00')
    expect(formatHHMM(d)).toBe('23:00')
  })
})

describe('formatCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00+09:00'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('1시간 뒤는 "01:00:00"을 반환한다', () => {
    const target = new Date('2026-01-01T13:00:00+09:00')
    expect(formatCountdown(target)).toBe('01:00:00')
  })

  it('3599초 뒤는 "00:59:59"를 반환한다 (시 경계 바로 아래)', () => {
    const target = new Date(Date.now() + 3599 * 1000)
    expect(formatCountdown(target)).toBe('00:59:59')
  })

  it('과거 시각은 "00:00:00"을 반환한다 (음수 diff 처리)', () => {
    const target = new Date(Date.now() - 1)
    expect(formatCountdown(target)).toBe('00:00:00')
  })
})

describe('formatEtaMinutes', () => {
  it('60초는 "1분"을 반환한다 (ceil 경계)', () => {
    expect(formatEtaMinutes(60)).toBe('1분')
  })

  it('61초는 "2분"을 반환한다 (ceil 올림)', () => {
    expect(formatEtaMinutes(61)).toBe('2분')
  })

  it('3600초는 "1시간"을 반환한다 (m===0 분기)', () => {
    expect(formatEtaMinutes(3600)).toBe('1시간')
  })

  it('3660초는 "1시간 1분"을 반환한다 (시+분 결합)', () => {
    expect(formatEtaMinutes(3660)).toBe('1시간 1분')
  })
})
