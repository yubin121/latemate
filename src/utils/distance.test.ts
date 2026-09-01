import { describe, it, expect } from 'vitest'
import { haversineDistance, isWithinRadius } from './distance'

describe('haversineDistance', () => {
  it('같은 좌표는 0m를 반환한다 (NaN 방지)', () => {
    const p = { lat: 37.5665, lng: 126.978 }
    expect(haversineDistance(p, p)).toBe(0)
  })

  it('서울시청 ↔ 강남역 직선거리는 약 8.79km(±50m)이다', () => {
    const cityHall = { lat: 37.5665, lng: 126.978 }
    const gangnam = { lat: 37.4979, lng: 127.0276 }
    const d = haversineDistance(cityHall, gangnam)
    expect(d).toBeGreaterThan(8_740)
    expect(d).toBeLessThan(8_840)
  })

  it('서울 ↔ 부산 거리는 약 325km(±3km)이다 (유클리드 오구현 검출)', () => {
    const seoul = { lat: 37.5665, lng: 126.978 }
    const busan = { lat: 35.1796, lng: 129.0756 }
    const d = haversineDistance(seoul, busan)
    expect(d).toBeGreaterThan(322_000)
    expect(d).toBeLessThan(328_000)
  })
})

describe('isWithinRadius', () => {
  it('정확히 반경 경계 지점은 포함으로 판정한다 (<=)', () => {
    // 위도 1도 ≈ 111km. 100m는 위도 약 0.0009도.
    // 반경 200m로 넉넉히 잡고 실제 거리가 그 이하인지 확인
    const a = { lat: 37.5665, lng: 126.978 }
    const b = { lat: 37.5665, lng: 126.978 } // 동일 좌표 = 0m
    expect(isWithinRadius(a, b, 0)).toBe(true) // 0 <= 0 → true
  })

  it('반경 밖 좌표는 false를 반환한다', () => {
    const cityHall = { lat: 37.5665, lng: 126.978 }
    const gangnam = { lat: 37.4979, lng: 127.0276 } // 7.3km
    expect(isWithinRadius(cityHall, gangnam, 100)).toBe(false)
  })
})
