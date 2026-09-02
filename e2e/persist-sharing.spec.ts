import { test, expect } from '@playwright/test'
import { setupMocks } from './mocks'
import { primeSession } from './fixtures/session'

test.describe('T-076 회귀 · 새로고침 시 위치 공유 상태 유지', () => {
  test('공유 시작 후 새로고침해도 "위치 공유 중" 상태가 복원된다', async ({ page }) => {
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

    await page.getByRole('button', { name: /위치 공유 시작하기/ }).click()
    await expect(page.getByRole('button', { name: /위치 공유 중/ })).toBeVisible()

    // location store 가 localStorage 에 persist 됐는지
    const before = await page.evaluate(() => localStorage.getItem('latemate-location'))
    expect(before).toContain('"isSharing":true')

    // 새로고침
    await page.reload()

    // 여전히 공유 중 상태여야 함 (regression: 예전엔 초기화됐음)
    await expect(page.getByRole('button', { name: /위치 공유 중/ })).toBeVisible()

    const after = await page.evaluate(() => localStorage.getItem('latemate-location'))
    expect(after).toContain('"isSharing":true')
  })
})
