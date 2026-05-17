import { supabase } from '@/lib/supabase'
import type { Coords, ParticipantStatus } from '@/types'

export async function upsertParticipantLocation(
  participantId: string,
  coords: Coords,
  etaSeconds?: number,
  status?: ParticipantStatus,
): Promise<void> {
  const { error } = await supabase.from('participant_locations').upsert({
    participant_id: participantId,
    lat: coords.lat,
    lng: coords.lng,
    is_sharing: true,
    eta_seconds: etaSeconds ?? null,
    status: status ?? null,
    updated_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
}

export async function stopSharingLocation(participantId: string): Promise<void> {
  const { error } = await supabase
    .from('participant_locations')
    .update({ is_sharing: false, updated_at: new Date().toISOString() })
    .eq('participant_id', participantId)

  if (error) throw new Error(error.message)
}

export async function updateLocationStatus(
  participantId: string,
  etaSeconds: number,
  status: ParticipantStatus,
): Promise<void> {
  const { error } = await supabase
    .from('participant_locations')
    .update({ eta_seconds: etaSeconds, status, updated_at: new Date().toISOString() })
    .eq('participant_id', participantId)

  if (error) throw new Error(error.message)
}
