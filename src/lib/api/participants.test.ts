import { describe, it, expect } from 'vitest'
import { normalizeParticipantRow } from './participants'

const baseRow = {
  id: 'p1',
  appointment_id: 'a1',
  nickname: '민준',
  session_key: 'sk1',
  is_host: false,
  joined_at: '2026-01-01T00:00:00Z',
}

const sampleLocation = {
  participant_id: 'p1',
  lat: 37.5,
  lng: 127,
  is_sharing: true,
  eta_seconds: 300,
  status: 'on_time' as const,
  updated_at: '2026-01-01T00:00:10Z',
}

describe('normalizeParticipantRow', () => {
  it('participant_locations가 요소 1개짜리 배열이면 첫 요소를 location으로 사용한다 (PostgREST v11 이하 응답)', () => {
    const row = { ...baseRow, participant_locations: [sampleLocation] }
    const result = normalizeParticipantRow(row)
    expect(result.location).toEqual(sampleLocation)
  })

  it('participant_locations가 빈 배열이면 location은 null이다 (위치 미공유 참여자)', () => {
    const row = { ...baseRow, participant_locations: [] }
    const result = normalizeParticipantRow(row)
    expect(result.location).toBeNull()
  })

  it('participant_locations가 객체(비배열)이면 그 객체를 location으로 사용한다 (T-063: PostgREST v12+ 회귀 방지)', () => {
    const row = { ...baseRow, participant_locations: sampleLocation }
    const result = normalizeParticipantRow(row)
    expect(result.location).toEqual(sampleLocation)
  })

  it('participant_locations가 null이면 location도 null이다', () => {
    const row = { ...baseRow, participant_locations: null }
    const result = normalizeParticipantRow(row)
    expect(result.location).toBeNull()
  })
})
