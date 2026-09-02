import { test, expect } from '@playwright/test'
import { setupMocks } from './mocks'

test.describe('초대 코드 참여 골든패스', () => {
  test('랜딩에서 코드 입력 → JoinPage → 참여 → 세션 저장', async ({ page }) => {
    const { supabase } = await setupMocks(page)
    const appointment = supabase.seedAppointment({ invite_code: 'ZZZZZ9', title: '한강 피크닉' })

    await page.goto('/')

    // 초대 코드 입력 (대문자 강제 변환은 컴포넌트가 담당)
    await page.getByPlaceholder('초대 코드 6자리').fill('zzzzz9')
    await page.getByRole('button', { name: '참여' }).click()

    // JoinPage 진입 확인
    await expect(page).toHaveURL(new RegExp(`/join/${appointment.id}$`))
    await expect(page.getByText('한강 피크닉')).toBeVisible()

    // 닉네임 입력 → 참여
    await page.getByPlaceholder('최대 10자').fill('민수')
    await page.getByRole('button', { name: '참여하기' }).click()

    // 약속 페이지로 이동
    await expect(page).toHaveURL(new RegExp(`/appointment/${appointment.id}$`))

    // localStorage에 session_key + zustand session 저장 확인
    const sessionKey = await page.evaluate(() => localStorage.getItem('latemate_session_key'))
    expect(sessionKey).toBeTruthy()

    const sessionPersist = await page.evaluate(() => localStorage.getItem('latemate-session'))
    expect(sessionPersist).toContain('민수')
    expect(sessionPersist).toContain(appointment.id)

    // Supabase에 participants 레코드가 삽입됐는지
    const inserted = supabase.state.participants.find((p) => p.nickname === '민수')
    expect(inserted).toBeTruthy()
    expect(inserted!.is_host).toBe(false)
  })
})
