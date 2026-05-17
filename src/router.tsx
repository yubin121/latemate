import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import MobileLayout from '@/components/layout/MobileLayout'
import SessionGuard from '@/components/layout/SessionGuard'
import ErrorBoundary from '@/components/layout/ErrorBoundary'
import Spinner from '@/components/ui/Spinner'

const HomePage = lazy(() => import('@/pages/HomePage'))
const CreatePage = lazy(() => import('@/pages/CreatePage'))
const JoinPage = lazy(() => import('@/pages/JoinPage'))
const AppointmentPage = lazy(() => import('@/pages/AppointmentPage'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-dvh">
      <Spinner size="lg" />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <MobileLayout />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<PageFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: '/create',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <CreatePage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: '/join/:appointmentId',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <JoinPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: '/appointment/:appointmentId',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <SessionGuard>
                <AppointmentPage />
              </SessionGuard>
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
