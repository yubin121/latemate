import { cn } from '@/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'h-12 px-4 rounded-2xl border bg-white text-base outline-none transition-colors',
          'border-gray-200 placeholder:text-gray-400',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
          error && 'border-status-late focus:border-status-late focus:ring-red-100',
          'disabled:bg-gray-50 disabled:text-gray-400',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-status-late">{error}</p>}
    </div>
  )
}
