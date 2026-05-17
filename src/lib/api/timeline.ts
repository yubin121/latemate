import { supabase } from '@/lib/supabase'
import type { TimelineEvent, TimelineEventType } from '@/types'

export interface TimelineEventWithNickname extends TimelineEvent {
  nickname: string | null
}

export async function insertTimelineEvent(
  appointmentId: string,
  eventType: TimelineEventType,
  participantId?: string,
): Promise<void> {
  const { error } = await supabase.from('timeline_events').insert({
    appointment_id: appointmentId,
    participant_id: participantId ?? null,
    event_type: eventType,
  })

  if (error) throw new Error(error.message)
}

export async function fetchTimeline(appointmentId: string): Promise<TimelineEventWithNickname[]> {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*, participants(nickname)')
    .eq('appointment_id', appointmentId)
    .order('occurred_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => {
    const participantData = (row as Record<string, unknown>)['participants']
    const nickname =
      participantData && typeof participantData === 'object' && 'nickname' in participantData
        ? String((participantData as Record<string, unknown>)['nickname'])
        : null

    return {
      id: row.id as string,
      appointment_id: row.appointment_id as string,
      participant_id: row.participant_id as string | null,
      event_type: row.event_type as TimelineEventType,
      occurred_at: row.occurred_at as string,
      nickname,
    }
  })
}
