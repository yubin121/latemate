import type { Page, Route } from '@playwright/test'

type UnknownRecord = Record<string, unknown>

interface Appointment extends UnknownRecord {
  id: string
  title: string
  place_name: string
  place_lat: number
  place_lng: number
  scheduled_at: string
  invite_code: string
  expires_at: string
}

interface Participant extends UnknownRecord {
  id: string
  appointment_id: string
  nickname: string
  session_key: string
  is_host: boolean
  joined_at: string
}

interface ParticipantLocation extends UnknownRecord {
  participant_id: string
  lat: number
  lng: number
  accuracy: number
  updated_at: string
}

interface TimelineEvent extends UnknownRecord {
  id: string
  appointment_id: string
  participant_id: string | null
  event_type: string
  created_at: string
}

export interface SupabaseMockState {
  appointments: Appointment[]
  participants: Participant[]
  participantLocations: ParticipantLocation[]
  timelineEvents: TimelineEvent[]
}

export interface SupabaseMock {
  state: SupabaseMockState
  seedAppointment: (partial?: Partial<Appointment>) => Appointment
  seedParticipant: (partial: Partial<Participant> & { appointment_id: string }) => Participant
}

const ISO_NOW = () => new Date().toISOString()
let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${++idCounter}`

function parseFilters(url: URL) {
  const filters: Record<string, string> = {}
  for (const [key, value] of url.searchParams.entries()) {
    if (['select', 'order', 'limit', 'offset'].includes(key)) continue
    if (value.startsWith('eq.')) filters[key] = value.slice(3)
    else filters[key] = value
  }
  return filters
}

function matchesFilters<T extends UnknownRecord>(row: T, filters: Record<string, string>) {
  return Object.entries(filters).every(([k, v]) => String(row[k]) === v)
}

function prefersSingle(route: Route) {
  const accept = route.request().headers()['accept'] ?? ''
  return accept.includes('application/vnd.pgrst.object+json')
}

async function readBody(route: Route): Promise<UnknownRecord | UnknownRecord[]> {
  const body = route.request().postData()
  if (!body) return {}
  return JSON.parse(body)
}

function fulfillJson(route: Route, data: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json; charset=utf-8',
    body: JSON.stringify(data),
  })
}

export async function installSupabaseMock(page: Page): Promise<SupabaseMock> {
  const state: SupabaseMockState = {
    appointments: [],
    participants: [],
    participantLocations: [],
    timelineEvents: [],
  }

  const seedAppointment: SupabaseMock['seedAppointment'] = (partial = {}) => {
    const now = Date.now()
    const scheduled = new Date(now + 60 * 60 * 1000).toISOString()
    const appointment: Appointment = {
      id: partial.id ?? nextId('apt'),
      title: partial.title ?? '테스트 약속',
      place_name: partial.place_name ?? '강남역 1번 출구',
      place_lat: partial.place_lat ?? 37.4979,
      place_lng: partial.place_lng ?? 127.0276,
      scheduled_at: partial.scheduled_at ?? scheduled,
      invite_code: partial.invite_code ?? 'ABC123',
      expires_at:
        partial.expires_at ?? new Date(new Date(scheduled).getTime() + 86_400_000).toISOString(),
    }
    state.appointments.push(appointment)
    return appointment
  }

  const seedParticipant: SupabaseMock['seedParticipant'] = (partial) => {
    const participant: Participant = {
      id: partial.id ?? nextId('p'),
      appointment_id: partial.appointment_id,
      nickname: partial.nickname ?? '테스터',
      session_key: partial.session_key ?? nextId('s'),
      is_host: partial.is_host ?? false,
      joined_at: partial.joined_at ?? ISO_NOW(),
    }
    state.participants.push(participant)
    return participant
  }

  await page.route(/e2e\.supabase\.test\/rest\/v1\//, async (route) => {
    const url = new URL(route.request().url())
    const method = route.request().method()
    const table = url.pathname.replace(/^.*\/rest\/v1\//, '').split('?')[0]
    const filters = parseFilters(url)

    if (table === 'appointments' && method === 'GET') {
      const rows = state.appointments.filter((row) => matchesFilters(row, filters))
      return fulfillJson(route, prefersSingle(route) ? (rows[0] ?? null) : rows)
    }

    if (table === 'appointments' && method === 'POST') {
      const body = (await readBody(route)) as Partial<Appointment>
      const inserted = seedAppointment(body)
      return fulfillJson(route, prefersSingle(route) ? inserted : [inserted], 201)
    }

    if (table === 'participants' && method === 'GET') {
      const withLocations = (url.searchParams.get('select') ?? '').includes(
        'participant_locations',
      )
      const rows = state.participants
        .filter((row) => matchesFilters(row, filters))
        .map((row) => {
          if (!withLocations) return row
          const location = state.participantLocations.find((l) => l.participant_id === row.id)
          return { ...row, participant_locations: location ?? null }
        })
      return fulfillJson(route, prefersSingle(route) ? (rows[0] ?? null) : rows)
    }

    if (table === 'participants' && method === 'POST') {
      const body = (await readBody(route)) as Partial<Participant> & { appointment_id: string }
      const inserted = seedParticipant(body)
      return fulfillJson(route, prefersSingle(route) ? inserted : [inserted], 201)
    }

    if (table === 'participant_locations' && method === 'POST') {
      const body = (await readBody(route)) as Partial<ParticipantLocation>
      const merged: ParticipantLocation = {
        participant_id: String(body.participant_id ?? ''),
        lat: Number(body.lat ?? 0),
        lng: Number(body.lng ?? 0),
        accuracy: Number(body.accuracy ?? 0),
        updated_at: ISO_NOW(),
      }
      const idx = state.participantLocations.findIndex(
        (l) => l.participant_id === merged.participant_id,
      )
      if (idx >= 0) state.participantLocations[idx] = merged
      else state.participantLocations.push(merged)
      return fulfillJson(route, prefersSingle(route) ? merged : [merged], 201)
    }

    if (table === 'participant_locations' && method === 'PATCH') {
      const body = (await readBody(route)) as Partial<ParticipantLocation>
      const idx = state.participantLocations.findIndex((l) =>
        matchesFilters(l as unknown as UnknownRecord, filters),
      )
      if (idx >= 0) {
        state.participantLocations[idx] = {
          ...state.participantLocations[idx],
          ...body,
          updated_at: ISO_NOW(),
        }
      }
      return fulfillJson(route, [])
    }

    if (table === 'timeline_events' && method === 'POST') {
      const body = (await readBody(route)) as Partial<TimelineEvent>
      const inserted: TimelineEvent = {
        id: nextId('ev'),
        appointment_id: String(body.appointment_id ?? ''),
        participant_id: (body.participant_id as string | null) ?? null,
        event_type: String(body.event_type ?? 'JOINED'),
        created_at: ISO_NOW(),
      }
      state.timelineEvents.push(inserted)
      return fulfillJson(route, prefersSingle(route) ? inserted : [inserted], 201)
    }

    if (table === 'timeline_events' && method === 'GET') {
      const rows = state.timelineEvents.filter((row) => matchesFilters(row, filters))
      return fulfillJson(route, rows)
    }

    return fulfillJson(route, prefersSingle(route) ? null : [])
  })

  return { state, seedAppointment, seedParticipant }
}
