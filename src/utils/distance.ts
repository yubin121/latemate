interface Coords {
  lat: number
  lng: number
}

/** Haversine 공식으로 두 좌표 간 거리(미터)를 계산 */
export function haversineDistance(a: Coords, b: Coords): number {
  const R = 6_371_000 // 지구 반지름 (m)
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)

  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng

  return 2 * R * Math.asin(Math.sqrt(h))
}

/** 두 좌표 간 거리가 radius(미터) 이내인지 확인 */
export function isWithinRadius(a: Coords, b: Coords, radiusMeters: number): boolean {
  return haversineDistance(a, b) <= radiusMeters
}
