export type { ParticipantStatus, TimelineEventType } from './supabase'
import type { Database } from './supabase'

export type Appointment = Database['public']['Tables']['appointments']['Row']
export type Participant = Database['public']['Tables']['participants']['Row']
export type ParticipantLocation = Database['public']['Tables']['participant_locations']['Row']
export type TimelineEvent = Database['public']['Tables']['timeline_events']['Row']

export interface Coords {
  lat: number
  lng: number
}

export interface ParticipantWithLocation extends Participant {
  location: ParticipantLocation | null
}

export interface CreateAppointmentInput {
  title: string
  place_name: string
  place_lat: number
  place_lng: number
  scheduled_at: string
}

export interface JoinAppointmentInput {
  appointmentId: string
  nickname: string
  sessionKey: string
}

export interface SessionData {
  appointmentId: string
  participantId: string
  sessionKey: string
  nickname: string
  isHost: boolean
}
