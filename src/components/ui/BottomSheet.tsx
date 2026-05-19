import { useRef, useState, useCallback, useEffect } from 'react'
import { cn } from '@/utils/cn'

type SnapPoint = 'collapsed' | 'half' | 'full'

interface BottomSheetProps {
  children: React.ReactNode
  defaultSnap?: SnapPoint
  className?: string
}

const SNAP_PX: Record<SnapPoint, string> = {
  collapsed: 'translate-y-[calc(100%-72px)]',
  half: 'translate-y-[50%]',
  full: 'translate-y-[10%]',
}

function nextSnap(current: SnapPoint, direction: 'up' | 'down'): SnapPoint {
  const order: SnapPoint[] = ['collapsed', 'half', 'full']
  const idx = order.indexOf(current)
  if (direction === 'up') return order[Math.min(idx + 1, order.length - 1)]
  return order[Math.max(idx - 1, 0)]
}

export default function BottomSheet({ children, defaultSnap = 'half', className }: BottomSheetProps) {
  const [snap, setSnap] = useState<SnapPoint>(defaultSnap)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const startOffset = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true)
    startY.current = e.clientY
    startOffset.current = dragOffset
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [dragOffset])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    const delta = e.clientY - startY.current
    setDragOffset(delta)
  }, [dragging])

  const onPointerUp = useCallback(() => {
    if (!dragging) return
    setDragging(false)

    const threshold = 60
    if (dragOffset < -threshold) {
      setSnap((s) => nextSnap(s, 'up'))
    } else if (dragOffset > threshold) {
      setSnap((s) => nextSnap(s, 'down'))
    }
    setDragOffset(0)
  }, [dragging, dragOffset])

  useEffect(() => {
    if (!dragging) setDragOffset(0)
  }, [dragging])

  return (
    <div
      ref={sheetRef}
      style={dragging ? { transform: `translateY(calc(${dragOffset}px))`, transition: 'none' } : undefined}
      className={cn(
        'absolute inset-x-0 bottom-0 h-full rounded-t-3xl bg-surface-card shadow-sheet z-10',
        'will-change-transform',
        !dragging && `transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${SNAP_PX[snap]}`,
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
