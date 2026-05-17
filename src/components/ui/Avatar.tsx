import { cn } from '@/utils/cn'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
]

function pickColor(name: string) {
  const code = name.charCodeAt(0) ?? 0
  return COLORS[code % COLORS.length]
}

export default function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initial = name.slice(0, 1).toUpperCase()

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold select-none flex-shrink-0',
        pickColor(name),
        {
          'w-8 h-8 text-xs': size === 'sm',
          'w-10 h-10 text-sm': size === 'md',
          'w-14 h-14 text-lg': size === 'lg',
        },
        className,
      )}
      aria-label={name}
    >
      {initial}
    </div>
  )
}
