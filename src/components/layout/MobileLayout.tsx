import { Outlet } from 'react-router-dom'
import ToastContainer from '@/components/ui/ToastContainer'
import OfflineBanner from '@/components/ui/OfflineBanner'

export default function MobileLayout() {
  return (
    <div className="relative mx-auto w-full max-w-[430px] min-h-dvh bg-surface-page overflow-hidden">
      <OfflineBanner />
      <Outlet />
      <ToastContainer />
    </div>
  )
}
