import Button from '@/components/ui/Button'

interface ConfirmModalProps {
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  variant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl px-6 pt-5 pb-[calc(env(safe-area-inset-bottom)+24px)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* 텍스트 */}
        <p className="text-lg font-bold text-gray-900 mb-2">{title}</p>
        {description && (
          <p className="text-sm text-gray-500 leading-relaxed mb-6">{description}</p>
        )}

        {/* 버튼 */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className={
              variant === 'danger'
                ? 'w-full h-12 rounded-2xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors'
                : 'w-full h-12 rounded-2xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors'
            }
          >
            {confirmLabel}
          </button>
          <Button variant="ghost" size="md" className="w-full" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
