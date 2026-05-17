import { supabase } from '@/lib/supabase'
import type { Appointment, CreateAppointmentInput } from '@/types'

export async function fetchAppointment(id: string): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Appointment
}

export async function fetchAppointmentByCode(inviteCode: string): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single()

  if (error) throw new Error('존재하지 않는 초대 코드입니다.')
  return data as Appointment
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const invite_code = generateInviteCode()
  const expires_at = new Date(
    new Date(input.scheduled_at).getTime() + 24 * 60 * 60 * 1000,
  ).toISOString()

  const { data, error } = await supabase
    .from('appointments')
    .insert({ ...input, invite_code, expires_at })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Appointment
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
