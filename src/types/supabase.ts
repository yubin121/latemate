export type ParticipantStatus = 'on_time' | 'late' | 'arrived' | 'unknown'
export type TimelineEventType = 'JOINED' | 'DEPARTED' | 'ARRIVED' | 'LATE_ALERT'

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          title: string
          place_name: string
          place_lat: number
          place_lng: number
          scheduled_at: string
          invite_code: string
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          title: string
          place_name: string
          place_lat: number
          place_lng: number
          scheduled_at: string
          invite_code: string
          created_at?: string
          expires_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      participants: {
        Row: {
          id: string
          appointment_id: string
          nickname: string
          session_key: string
          is_host: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          nickname: string
          session_key: string
          is_host?: boolean
          joined_at?: string
        }
        Update: Partial<Database['public']['Tables']['participants']['Insert']>
      }
      participant_locations: {
        Row: {
          participant_id: string
          lat: number | null
          lng: number | null
          is_sharing: boolean
          eta_seconds: number | null
          status: ParticipantStatus | null
          updated_at: string
        }
        Insert: {
          participant_id: string
          lat?: number | null
          lng?: number | null
          is_sharing?: boolean
          eta_seconds?: number | null
          status?: ParticipantStatus | null
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['participant_locations']['Insert']>
      }
      timeline_events: {
        Row: {
          id: string
          appointment_id: string
          participant_id: string | null
          event_type: TimelineEventType
          occurred_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          participant_id?: string | null
          event_type: TimelineEventType
          occurred_at?: string
        }
        Update: Partial<Database['public']['Tables']['timeline_events']['Insert']>
      }
    }
  }
}
