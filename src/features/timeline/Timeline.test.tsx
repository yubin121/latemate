import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Timeline from './Timeline'
import type { TimelineEventWithNickname } from '@/lib/api/timeline'

function makeEvent(
  overrides: Partial<TimelineEventWithNickname>,
): TimelineEventWithNickname {
  return {
    id: 'e1',
    appointment_id: 'a1',
    participant_id: 'p1',
    event_type: 'JOINED',
    occurred_at: '2026-01-01T12:00:00+09:00',
    nickname: '민준',
    ...overrides,
  }
}

describe('Timeline', () => {
  it('JOINED + 받침 있는 이름 → "이 참여했어요" 렌더', () => {
    const { container } = render(
      <Timeline events={[makeEvent({ event_type: 'JOINED', nickname: '민준' })]} />,
    )
    expect(container.textContent).toContain('민준이 참여했어요')
  })

  it('DEPARTED + 받침 없는 이름 → "가 출발했어요" 렌더', () => {
    const { container } = render(
      <Timeline events={[makeEvent({ event_type: 'DEPARTED', nickname: '지수' })]} />,
    )
    expect(container.textContent).toContain('지수가 출발했어요')
  })

  it('ARRIVED는 "도착했어요" 렌더', () => {
    const { container } = render(
      <Timeline events={[makeEvent({ event_type: 'ARRIVED', nickname: '민준' })]} />,
    )
    expect(container.textContent).toContain('민준이 도착했어요')
  })

  it('LATE_ALERT는 "지각 예상이에요" 렌더', () => {
    const { container } = render(
      <Timeline events={[makeEvent({ event_type: 'LATE_ALERT', nickname: '지수' })]} />,
    )
    expect(container.textContent).toContain('지수가 지각 예상이에요')
  })

  it('nickname이 null이면 "알 수 없음" fallback을 렌더한다 (crash 방지)', () => {
    const { container } = render(
      <Timeline events={[makeEvent({ event_type: 'JOINED', nickname: null })]} />,
    )
    expect(container.textContent).toContain('알 수 없음이 참여했어요')
  })

  it('events가 빈 배열이면 EmptyTimeline을 렌더한다', () => {
    render(<Timeline events={[]} />)
    expect(screen.getByText('아직 이벤트가 없어요')).toBeInTheDocument()
  })
})
