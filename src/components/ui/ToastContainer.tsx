import { X, CheckCircle, XCircle, Info } from 'lucide-react'
import { useToastStore, type ToastType } from '@/stores/toastStore'
import { cn } from '@/utils/cn'

const ICON: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} strokeWidth={1.5} className="text-status-on-time flex-shrink-0" />,
  error: <XCircle size={18} strokeWidth={1.5} className="text-status-late flex-shrink-0" />,
  info: <Info size={18} strokeWidth={1.5} className="text-status-arrived flex-shrink-0" />,
}

const BG: Record<ToastType, string> = {
  success: 'bg-white border-l-4 border-status-on-time',
  error: 'bg-white border-l-4 border-status-late',
  info: 'bg-white border-l-4 border-status-arrived',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-float pointer-events-auto',
            'animate-slide-up',
            BG[toast.type],
          )}
        >
          {ICON[toast.type]}
          <p className="flex-1 text-sm font-medium text-gray-800">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
      ))}
    </div>
  )
}
