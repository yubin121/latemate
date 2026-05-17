import { AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

interface ErrorScreenProps {
  title?: string
  message?: string
  onRetry?: () => void
  onHome?: () => void
}

export default function ErrorScreen({
  title = '문제가 발생했어요',
  message = '잠시 후 다시 시도해주세요.',
  onRetry,
  onHome,
}: ErrorScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 gap-4 bg-surface-page">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle size={32} strokeWidth={1.5} className="text-status-late" />
      </div>
      <div className="text-center">
        <p className="text-base font-bold text-gray-900 mb-1">{title}</p>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
      <div className="flex gap-3 mt-2">
        {onHome && (
          <Button variant="secondary" size="md" onClick={onHome}>
            홈으로
          </Button>
        )}
        {onRetry && (
          <Button size="md" onClick={onRetry}>
            다시 시도
          </Button>
        )}
      </div>
    </div>
  )
}
