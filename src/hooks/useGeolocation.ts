import { useRef, useCallback } from 'react'
import { useLocationStore } from '@/stores/locationStore'
import { useUpdateLocation } from '@/hooks/useUpdateLocation'
import { haversineDistance } from '@/utils/distance'
import { MIN_UPLOAD_DISTANCE_M, MAX_UPLOAD_INTERVAL_MS } from '@/constants'
import type { Coords } from '@/types'

interface UseGeolocationOptions {
  participantId: string
}

export function useGeolocation({ participantId }: UseGeolocationOptions) {
  const { setSharing, setCoords, setError, setWatchId, watchId, reset } = useLocationStore()
  const { mutate: uploadLocation } = useUpdateLocation()

  const lastUploadedCoordsRef = useRef<Coords | null>(null)
  const lastUploadedAtRef = useRef<number>(0)

  const shouldUpload = useCallback((newCoords: Coords): boolean => {
    const now = Date.now()
    const timeSinceLast = now - lastUploadedAtRef.current
    if (timeSinceLast >= MAX_UPLOAD_INTERVAL_MS) return true

    const last = lastUploadedCoordsRef.current
    if (!last) return true

    return haversineDistance(last, newCoords) >= MIN_UPLOAD_DISTANCE_M
  }, [])

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 공유를 지원하지 않아요.')
      return
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const coords: Coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setCoords(coords, position.coords.accuracy)

        if (shouldUpload(coords)) {
          uploadLocation({ participantId, coords })
          lastUploadedCoordsRef.current = coords
          lastUploadedAtRef.current = Date.now()
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('위치 권한이 거부됐어요. 브라우저 설정에서 허용해주세요.')
        }
        // TIMEOUT/POSITION_UNAVAILABLE: 이전 위치 유지, 에러 무시
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 3000 },
    )

    setWatchId(id)
    setSharing(true)
  }, [participantId, setCoords, setError, setSharing, setWatchId, shouldUpload, uploadLocation])

  const stopSharing = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
    }
    reset()
    lastUploadedCoordsRef.current = null
    lastUploadedAtRef.current = 0
  }, [watchId, reset])

  return { startSharing, stopSharing }
}
