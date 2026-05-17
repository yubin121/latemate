import { supabase } from '@/lib/supabase'
import type { Participant, ParticipantWithLocation, JoinAppointmentInput, SessionData } from '@/types'

export async function joinAppointment(input: JoinAppointmentInput): Promise<Participant> {
  const { data, error } = await supabase
    .from('participants')
    .insert({
      appointment_id: input.appointmentId,
      nickname: input.nickname,
      session_key: input.sessionKey,
      is_host: false,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('이미 사용 중인 닉네임입니다.')
    throw new Error(error.message)
  }
  return data as Participant
}

export async function createHostParticipant(
  appointmentId: string,
  nickname: string,
  sessionKey: string,
): Promise<Participant> {
  const { data, error } = await supabase
    .from('participants')
    .insert({ appointment_id: appointmentId, nickname, session_key: sessionKey, is_host: true })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Participant
}

export async function fetchParticipantsWithLocations(
  appointmentId: string,
): Promise<ParticipantWithLocation[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('*, participant_locations(*)')
    .eq('appointment_id', appointmentId)
    .order('joined_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => {
    const locations = (row as Record<string, unknown>)['participant_locations']
    return {
      id: row.id as string,
      appointment_id: row.appointment_id as string,
      nickname: row.nickname as string,
      session_key: row.session_key as string,
      is_host: row.is_host as boolean,
      joined_at: row.joined_at as string,
      location: Array.isArray(locations) ? (locations[0] ?? null) : null,
    } as ParticipantWithLocation
  })
}

export async function restoreSession(
  appointmentId: string,
  sessionKey: string,
): Promise<SessionData | null> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('appointment_id', appointmentId)
    .eq('session_key', sessionKey)
    .single()

  if (error || !data) return null

  const row = data as Participant
  return {
    appointmentId: row.appointment_id,
    participantId: row.id,
    sessionKey: row.session_key,
    nickname: row.nickname,
    isHost: row.is_host,
  }
}
