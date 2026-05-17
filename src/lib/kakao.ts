export interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void
  setBounds(bounds: KakaoLatLngBounds, padding?: number): void
  getLevel(): number
}

export interface KakaoLatLng {
  getLat(): number
  getLng(): number
}

export interface KakaoLatLngBounds {
  extend(latlng: KakaoLatLng): void
  isEmpty(): boolean
}

export interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void
  setPosition(latlng: KakaoLatLng): void
  getContent(): string | HTMLElement
}

interface KakaoMapConstructor {
  new (container: HTMLElement, options: { center: KakaoLatLng; level: number }): KakaoMap
}

interface KakaoLatLngConstructor {
  new (lat: number, lng: number): KakaoLatLng
}

interface KakaoLatLngBoundsConstructor {
  new (): KakaoLatLngBounds
}

interface KakaoCustomOverlayConstructor {
  new (options: {
    position: KakaoLatLng
    content: string | HTMLElement
    map?: KakaoMap | null
    yAnchor?: number
    zIndex?: number
  }): KakaoCustomOverlay
}

interface KakaoMapsNamespace {
  load(callback: () => void): void
  Map: KakaoMapConstructor
  LatLng: KakaoLatLngConstructor
  LatLngBounds: KakaoLatLngBoundsConstructor
  CustomOverlay: KakaoCustomOverlayConstructor
  event: {
    addListener(target: KakaoMap, type: string, handler: () => void): void
  }
}

declare global {
  interface Window {
    kakao: {
      maps: KakaoMapsNamespace
    }
  }
}
