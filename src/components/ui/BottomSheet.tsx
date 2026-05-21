import { useRef, useCallback, useLayoutEffect } from 'react'
import { cn } from '@/utils/cn'

type SnapPoint = 'collapsed' | 'half' | 'full'

interface BottomSheetProps {
  children: React.ReactNode
  defaultSnap?: SnapPoint
  className?: string
}

const SNAP_ORDER: SnapPoint[] = ['collapsed', 'half', 'full']

function getSnapY(snap: SnapPoint, containerH: number): number {
  switch (snap) {
    case 'collapsed': return containerH - 72
    case 'half':      return containerH * 0.5
    case 'full':      return containerH * 0.1
  }
}

export default function BottomSheet({ children, defaultSnap = 'half', className }: BottomSheetProps) {
  const sheetRef     = useRef<HTMLDivElement>(null)
  const snapRef      = useRef<SnapPoint>(defaultSnap)
  const currentY     = useRef(0)   // 실제 translateY (px)
  const startPtrY    = useRef(0)   // 드래그 시작 시 포인터 Y
  const startSheetY  = useRef(0)   // 드래그 시작 시 시트 Y
  const lastPtrY     = useRef(0)
  const lastTime     = useRef(0)
  const velocity     = useRef(0)   // px/ms
  const dragging     = useRef(false)

  function containerH(): number {
    return sheetRef.current?.parentElement?.clientHeight ?? window.innerHeight
  }

  function applyTransform(y: number, animate: boolean) {
    const el = sheetRef.current
    if (!el) return
    currentY.current = y
    el.style.transition = animate
      ? 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
      : 'none'
    el.style.transform = `translateY(${y}px)`
  }

  function goToSnap(snap: SnapPoint) {
    snapRef.current = snap
    applyTransform(getSnapY(snap, containerH()), true)
  }

  // 첫 렌더 전에 위치 설정 (useLayoutEffect → 플래시 없음)
  useLayoutEffect(() => {
    applyTransform(getSnapY(defaultSnap, containerH()), false)

    function onResize() {
      applyTransform(getSnapY(snapRef.current, containerH()), false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = sheetRef.current
    if (!el) return

    // 진행 중인 transition 애니메이션이 있으면 현재 시각적 위치에서 중단
    const computed = getComputedStyle(el).transform
    const visualY = computed !== 'none' ? new DOMMatrix(computed).m42 : currentY.current
    currentY.current = visualY
    el.style.transition = 'none'
    el.style.transform = `translateY(${visualY}px)`

    dragging.current    = true
    startPtrY.current   = e.clientY
    startSheetY.current = visualY
    lastPtrY.current    = e.clientY
    lastTime.current    = e.timeStamp
    velocity.current    = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return

    // 속도 측정
    const dt = e.timeStamp - lastTime.current
    if (dt > 0) velocity.current = (e.clientY - lastPtrY.current) / dt
    lastPtrY.current = e.clientY
    lastTime.current = e.timeStamp

    const h          = containerH()
    const minY       = getSnapY('full', h)
    const maxY       = getSnapY('collapsed', h)
    const rawY       = startSheetY.current + (e.clientY - startPtrY.current)

    // 경계 초과 시 러버밴드 저항
    let y: number
    if (rawY < minY) {
      y = minY + (rawY - minY) * 0.3
    } else if (rawY > maxY) {
      y = maxY + (rawY - maxY) * 0.3
    } else {
      y = rawY
    }

    applyTransform(y, false)
  }, [])

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false

    const h              = containerH()
    const vel            = velocity.current
    const FLICK_VELOCITY = 0.4  // px/ms
    const currentIdx     = SNAP_ORDER.indexOf(snapRef.current)
    let targetSnap       = snapRef.current

    if (vel < -FLICK_VELOCITY) {
      // 위로 플릭 → 확장
      targetSnap = SNAP_ORDER[Math.min(currentIdx + 1, SNAP_ORDER.length - 1)]
    } else if (vel > FLICK_VELOCITY) {
      // 아래로 플릭 → 축소
      targetSnap = SNAP_ORDER[Math.max(currentIdx - 1, 0)]
    } else {
      // 가장 가까운 스냅 포인트로 흡착
      let minDist = Infinity
      for (const snap of SNAP_ORDER) {
        const dist = Math.abs(currentY.current - getSnapY(snap, h))
        if (dist < minDist) {
          minDist = dist
          targetSnap = snap
        }
      }
    }

    goToSnap(targetSnap)
  }, [])

  return (
    <div
      ref={sheetRef}
      className={cn(
        'absolute inset-x-0 bottom-0 h-full rounded-t-3xl bg-surface-card shadow-sheet z-10 will-change-transform',
        className,
      )}
    >
      {/* 드래그 핸들 */}
      <div
        className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="w-10 h-1 rounded-full bg-gray-200" />
      </div>

      {/* 콘텐츠 */}
      <div className="overflow-y-auto overscroll-contain h-[calc(100%-40px)] pb-[env(safe-area-inset-bottom)]">
        {children}
      </div>
    </div>
  )
}
