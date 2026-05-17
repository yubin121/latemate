import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import type { KakaoMap, KakaoCustomOverlay } from '@/lib/kakao'
import type { Appointment, ParticipantWithLocation, ParticipantStatus } from '@/types'

interface AppointmentMapProps {
  appointment: Appointment
  participants: ParticipantWithLocation[]
  myParticipantId?: string
}

const STATUS_COLOR: Record<ParticipantStatus, string> = {
  on_time: '#10B981',
  late: '#EF4444',
  arrived: '#3B82F6',
  unknown: '#9CA3AF',
}

function makeDestinationMarkerContent(): string {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
      <div style="
        width:44px;height:44px;border-radius:50%;
        background:#4F46E5;
        display:flex;align-items:center;justify-content:center;
        font-size:20px;
        box-shadow:0 2px 8px rgba(79,70,229,0.4);
        border:3px solid white;
      ">🏁</div>
      <span style="
        background:white;padding:2px 8px;border-radius:20px;
        font-size:11px;font-weight:700;color:#4F46E5;
        box-shadow:0 1px 4px rgba(0,0,0,0.12);
        white-space:nowrap;
      ">목적지</span>
    </div>
  `
}

function makeParticipantMarkerContent(
  nickname: string,
  status: ParticipantStatus,
  isSharing: boolean,
): string {
  const color = STATUS_COLOR[status]
  const initial = nickname.slice(0, 1).toUpperCase()
  const pulse = isSharing
    ? `<div style="
        position:absolute;top:-2px;right:-2px;
        width:10px;height:10px;border-radius:50%;
        background:#10B981;border:2px solid white;
        animation:live-pulse 2s ease-in-out infinite;
      "></div>`
    : ''

  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
      <div style="position:relative">
        <div style="
          width:38px;height:38px;border-radius:50%;
          background:${color};
          display:flex;align-items:center;justify-content:center;
          color:white;font-size:15px;font-weight:700;
          box-shadow:0 2px 6px rgba(0,0,0,0.2);
          border:2.5px solid white;
        ">${initial}</div>
        ${pulse}
      </div>
      <span style="
        background:white;padding:2px 7px;border-radius:20px;
        font-size:11px;font-weight:600;color:#111827;
        box-shadow:0 1px 4px rgba(0,0,0,0.10);
        white-space:nowrap;max-width:70px;overflow:hidden;text-overflow:ellipsis;
      ">${nickname}</span>
    </div>
  `
}

export default function AppointmentMap({
  appointment,
  participants,
  myParticipantId,
}: AppointmentMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<KakaoMap | null>(null)
  const destMarkerRef = useRef<KakaoCustomOverlay | null>(null)
  const participantMarkersRef = useRef<Map<string, KakaoCustomOverlay>>(new Map())
  const userInteractedRef = useRef(false)
  const [kakaoUnavailable, setKakaoUnavailable] = useState(false)

  // 지도 초기화
  useEffect(() => {
    if (!containerRef.current) return

    if (typeof window.kakao === 'undefined') {
      setKakaoUnavailable(true)
      return
    }

    window.kakao.maps.load(() => {
      if (mapRef.current) return // 중복 초기화 방지

      const center = new window.kakao.maps.LatLng(appointment.place_lat, appointment.place_lng)
      const map = new window.kakao.maps.Map(containerRef.current!, { center, level: 5 })
      mapRef.current = map

      // 목적지 마커
      const destOverlay = new window.kakao.maps.CustomOverlay({
        position: center,
        content: makeDestinationMarkerContent(),
        map,
        yAnchor: 1,
        zIndex: 5,
      })
      destMarkerRef.current = destOverlay

      // 사용자 직접 조작 감지
      window.kakao.maps.event.addListener(map, 'dragstart', () => {
        userInteractedRef.current = true
      })
    })

    return () => {
      // 마커 정리
      participantMarkersRef.current.forEach((overlay) => overlay.setMap(null))
      participantMarkersRef.current.clear()
      destMarkerRef.current?.setMap(null)
      mapRef.current = null
    }
  }, [appointment.place_lat, appointment.place_lng])

  // 참여자 마커 동기화 + bounds 조정
  useEffect(() => {
    const map = mapRef.current
    if (!map || typeof window.kakao === 'undefined') return

    const kakao = window.kakao
    const currentIds = new Set(participants.map((p) => p.id))

    // 퇴장한 참여자 마커 제거
    participantMarkersRef.current.forEach((overlay, id) => {
      if (!currentIds.has(id)) {
        overlay.setMap(null)
        participantMarkersRef.current.delete(id)
      }
    })

    const bounds = new kakao.maps.LatLngBounds()
    bounds.extend(new kakao.maps.LatLng(appointment.place_lat, appointment.place_lng))

    participants.forEach((p) => {
      const loc = p.location
      const status: ParticipantStatus = (loc?.status as ParticipantStatus) ?? 'unknown'
      const isSharing = loc?.is_sharing ?? false
      const content = makeParticipantMarkerContent(p.nickname, status, isSharing)

      if (loc?.lat != null && loc?.lng != null) {
        const pos = new kakao.maps.LatLng(loc.lat, loc.lng)
        bounds.extend(pos)

        const existing = participantMarkersRef.current.get(p.id)
        if (existing) {
          existing.setPosition(pos)
          // 내용 갱신 (상태 변화 시)
          const el = existing.getContent()
          if (typeof el === 'string' && el !== content) {
            const wrapper = document.createElement('div')
            wrapper.innerHTML = content
            existing.setMap(null)
            const newOverlay = new kakao.maps.CustomOverlay({
              position: pos,
              content,
              map,
              yAnchor: 1,
              zIndex: p.id === myParticipantId ? 10 : 3,
            })
            participantMarkersRef.current.set(p.id, newOverlay)
          }
        } else {
          const overlay = new kakao.maps.CustomOverlay({
            position: pos,
            content,
            map,
            yAnchor: 1,
            zIndex: p.id === myParticipantId ? 10 : 3,
          })
          participantMarkersRef.current.set(p.id, overlay)
        }
      }
    })

    // Bounds 자동 조정 (사용자가 직접 조작하지 않은 경우)
    if (!userInteractedRef.current && !bounds.isEmpty()) {
      map.setBounds(bounds, 80)
    }
  }, [participants, appointment.place_lat, appointment.place_lng, myParticipantId])

  if (kakaoUnavailable) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-100">
        <MapPin size={28} strokeWidth={1.5} className="text-gray-400" />
        <p className="text-sm text-gray-400">지도를 불러올 수 없어요</p>
        <p className="text-xs text-gray-300">{appointment.place_name}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: 0 }}
    />
  )
}
