import { cn } from '@/utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-brand-600 text-white hover:bg-brand-700 shadow-card': variant === 'primary',
          'bg-brand-50 text-brand-600 hover:bg-brand-100': variant === 'secondary',
          'text-brand-600 hover:bg-brand-50': variant === 'ghost',
        },
        {
          'h-9 px-4 text-sm min-w-[44px]': size === 'sm',
          'h-12 px-6 text-base min-w-[44px]': size === 'md',
          'h-14 px-8 text-lg min-w-[44px]': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  )
}
