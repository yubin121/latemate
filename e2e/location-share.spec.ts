import { test, expect } from '@playwright/test'
import { setupMocks } from './mocks'
import { primeSession } from './fixtures/session'

test.describe('위치 공유 골든패스', () => {
  test('공유 시작 버튼 → 상태 전환 + Supabase에 위치 업로드', async ({ page }) => {
    const { supabase } = await setupMocks(page)
    const appointment = supabase.seedAppointment()
    const host = supabase.seedParticipant({
      appointment_id: appointment.id,
      nickname: '유빈',
      is_host: true,
    })

    await primeSession(page, {
      appointmentId: appointment.id,
      participantId: host.id,
      sessionKey: host.session_key,
      nickname: host.nickname,
      isHost: true,
    })

    await page.goto(`/appointment/${appointment.id}`)

    const startButton = page.getByRole('button', { name: /위치 공유 시작하기/ })
    await expect(startButton).toBeVisible()
    await startButton.click()

    // 버튼이 "위치 공유 중"으로 전환
    await expect(page.getByRole('button', { name: /위치 공유 중/ })).toBeVisible()

    // Supabase에 위치가 업로드됐는지 (upsert)
    await expect
      .poll(() => supabase.state.participantLocations.length, { timeout: 5000 })
      .toBeGreaterThan(0)

    const uploaded = supabase.state.participantLocations[0]!
    expect(uploaded.participant_id).toBe(host.id)
    expect(uploaded.lat).toBeCloseTo(37.4979, 3)
    expect(uploaded.lng).toBeCloseTo(127.0276, 3)
  })
})
