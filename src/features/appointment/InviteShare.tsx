import { useState } from 'react'
import { Copy, Check, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

interface InviteShareProps {
  inviteCode: string
  onClose: () => void
}

export default function InviteShare({ inviteCode, onClose }: InviteShareProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopyCode() {
    await navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-[430px] bg-white rounded-t-3xl p-6 pb-[calc(env(safe-area-inset-bottom)+24px)] animate-slide-up">
        {/* 닫기 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">약속이 만들어졌어요! 🎉</h2>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center -mr-2 text-gray-400"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* 초대 코드 */}
        <div className="mb-5">
          <p className="text-xs text-gray-400 mb-2">초대 코드</p>
          <div className="bg-brand-50 rounded-2xl px-6 py-4 flex justify-center">
            <span className="font-mono text-3xl font-bold text-brand-700 tracking-[0.4em]">
              {inviteCode}
            </span>
          </div>
        </div>

        {/* 복사 버튼 */}
        <button
          onClick={handleCopyCode}
          className={cn(
            'w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-150 mb-3',
            copied
              ? 'bg-emerald-50 text-status-on-time border border-emerald-200'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200',
          )}
        >
          {copied ? (
            <>
              <Check size={16} strokeWidth={2} />
              복사됐어요!
            </>
          ) : (
            <>
              <Copy size={16} strokeWidth={1.5} />
              코드 복사
            </>
          )}
        </button>

        <Button variant="ghost" size="md" className="w-full" onClick={onClose}>
          약속 화면으로 →
        </Button>
      </div>
    </div>
  )
}
