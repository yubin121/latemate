export interface KakaoPlace {
  id: string
  place_name: string
  address_name: string
  road_address_name: string
  x: string
  y: string
}

interface KakaoLocalResponse {
  documents: KakaoPlace[]
}

export async function searchPlaces(query: string): Promise<KakaoPlace[]> {
  if (!query.trim()) return []

  const params = new URLSearchParams({ query, size: '8' })
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`,
    {
      headers: {
        Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`,
      },
    },
  )

  if (!res.ok) throw new Error('장소 검색에 실패했습니다.')

  const json = (await res.json()) as KakaoLocalResponse
  return json.documents ?? []
}
