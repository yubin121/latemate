import { useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useAppointment } from '@/hooks/useAppointment'
import { useParticipants } from '@/hooks/useParticipants'
import { useTimeline } from '@/hooks/useTimeline'
import { useEta } from '@/hooks/useEta'
import { useSessionStore } from '@/stores/sessionStore'
import AppointmentHeader from '@/features/appointment/AppointmentHeader'
import AppointmentMap from '@/features/map/AppointmentMap'
import ParticipantList from '@/features/appointment/ParticipantList'
import Timeline from '@/features/timeline/Timeline'
import LocationControl from '@/features/location/LocationControl'
import InviteShare from '@/features/appointment/InviteShare'
import BottomSheet from '@/components/ui/BottomSheet'
import Spinner from '@/components/ui/Spinner'
import { ParticipantListSkeleton, TimelineSkeletonList } from '@/components/ui/Skeleton'

function EtaController({
  participantId,
  appointmentId,
  placeLat,
  placeLng,
  scheduledAt,
}: {
  participantId: string
  appointmentId: string
  placeLat: number
  placeLng: number
  scheduledAt: string
}) {
  useEta({
    participantId,
    appointmentId,
    destination: { lat: placeLat, lng: placeLng },
    scheduledAt,
  })
  return null
}

export default function AppointmentPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>()
  const location = useLocation()
  const session = useSessionStore((s) => s.session)

  const { data: appointment, isLoading } = useAppointment(appointmentId!)
  const { data: participants = [], isLoading: participantsLoading } = useParticipants(appointmentId!)
  const { data: timelineEvents = [], isLoading: timelineLoading } = useTimeline(appointmentId!)

  const [showInvite, setShowInvite] = useState(
    () => (location.state as { newlyCreated?: boolean } | null)?.newlyCreated === true,
  )

  if (isLoading || !appointment) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-surface-page">
      <AppointmentHeader appointment={appointment} />

      {session && (
        <EtaController
          participantId={session.participantId}
          appointmentId={appointmentId!}
          placeLat={appointment.place_lat}
          placeLng={appointment.place_lng}
          scheduledAt={appointment.scheduled_at}
        />
      )}

      <div className="relative flex-1 overflow-hidden">
        <AppointmentMap
          appointment={appointment}
          participants={participants}
          myParticipantId={session?.participantId}
        />

        <BottomSheet defaultSnap="half">
          <div className="px-4 pb-8 space-y-5">
            {session && (
              <LocationControl
                participantId={session.participantId}
                appointmentId={appointmentId!}
              />
            )}

            {participantsLoading ? (
              <ParticipantListSkeleton />
            ) : (
              <ParticipantList
                participants={participants}
                myParticipantId={session?.participantId}
              />
            )}

            <div className="border-t border-gray-100 pt-5">
              {timelineLoading ? <TimelineSkeletonList /> : <Timeline events={timelineEvents} />}
            </div>
          </div>
        </BottomSheet>
      </div>

      {showInvite && (
        <InviteShare
          inviteCode={appointment.invite_code}
          appointmentId={appointment.id}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  )
}
