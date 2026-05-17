import type { Coords } from '@/types'

interface DirectionsResponse {
  routes: Array<{
    summary: {
      duration: number
    }
  }>
}

export async function fetchEtaSeconds(origin: Coords, destination: Coords): Promise<number> {
  const params = new URLSearchParams({
    origin: `${origin.lng},${origin.lat}`,
    destination: `${destination.lng},${destination.lat}`,
  })

  const res = await fetch(
    `https://apis-navi.kakaomobility.com/v1/directions?${params.toString()}`,
    {
      headers: {
        Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`,
      },
    },
  )

  if (!res.ok) throw new Error('ETA 계산 실패')

  const json = (await res.json()) as DirectionsResponse
  const duration = json.routes?.[0]?.summary?.duration

  if (duration == null) throw new Error('경로를 찾을 수 없습니다.')
  return duration
}
