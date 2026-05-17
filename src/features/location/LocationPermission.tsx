import { useState } from 'react'
import { NavigationOff, ChevronDown, ChevronUp } from 'lucide-react'

export default function LocationPermission() {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
      <div className="flex items-start gap-3">
        <NavigationOff size={18} strokeWidth={1.5} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800">위치 권한이 필요해요</p>
          <p className="text-xs text-amber-600 mt-1 leading-relaxed">
            위치 공유 없이도 다른 참여자의 위치는 볼 수 있어요.
            내 위치를 공유하려면 브라우저 설정에서 권한을 허용해주세요.
          </p>

          <button
            onClick={() => setShowGuide((v) => !v)}
            className="flex items-center gap-1 mt-2 text-xs font-semibold text-amber-700"
          >
            {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            설정 방법 보기
          </button>

          {showGuide && (
            <div className="mt-2 text-xs text-amber-700 leading-relaxed space-y-1">
              <p className="font-semibold">iOS Safari</p>
              <p>설정 앱 → Safari → 위치 → 이 웹 사이트 허용</p>
              <p className="font-semibold mt-1">Android Chrome</p>
              <p>주소창 왼쪽 자물쇠 아이콘 → 위치 → 허용</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
