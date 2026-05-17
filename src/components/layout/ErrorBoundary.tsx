import { Component, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-dvh px-6 gap-4 bg-surface-page">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle size={32} strokeWidth={1.5} className="text-status-late" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-gray-900 mb-1">문제가 발생했어요</p>
            <p className="text-sm text-gray-500">앱을 새로고침해주세요.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="h-12 px-6 bg-brand-600 text-white text-base font-semibold rounded-2xl"
          >
            새로고침
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
