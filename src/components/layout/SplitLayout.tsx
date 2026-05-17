import { cn } from '@/utils/cn'

interface SplitLayoutProps {
  panel: React.ReactNode
  map: React.ReactNode
  className?: string
}

export default function SplitLayout({ panel, map, className }: SplitLayoutProps) {
  return (
    <div className={cn('hidden md:flex h-dvh w-full', className)}>
      <aside className="w-[480px] flex-shrink-0 h-full overflow-y-auto bg-surface-card shadow-card z-10">
        {panel}
      </aside>
      <main className="flex-1 h-full relative">{map}</main>
    </div>
  )
}
