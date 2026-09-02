import { test, expect } from '@playwright/test'
import { setupMocks } from './mocks'

test.describe('약속 생성 골든패스', () => {
  test('제목·장소·시간·닉네임 입력 → 약속 페이지 이동 + 초대 코드 노출', async ({ page }) => {
    const { supabase } = await setupMocks(page)

    await page.goto('/')

    // 랜딩 → 약속 만들기
    await page.getByRole('button', { name: '약속 만들기' }).first().click()
    await expect(page).toHaveURL(/\/create$/)

    // 제목
    await page.getByPlaceholder('예: 강남역 치킨').fill('강남 저녁')

    // 장소 검색 → 결과 선택 (mock이 항상 "강남역 1번 출구" 반환)
    await page.getByPlaceholder('장소 검색').fill('강남')
    await page.getByRole('button', { name: /강남역 1번 출구/ }).click()

    // 날짜: 내일, 시간: 18:00
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yyyy = tomorrow.getFullYear()
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const dd = String(tomorrow.getDate()).padStart(2, '0')
    await page.locator('input[type="date"]').fill(`${yyyy}-${mm}-${dd}`)
    await page.locator('input[type="time"]').fill('18:00')

    // 닉네임
    await page.getByPlaceholder('약속 안에서 사용할 이름').fill('유빈')

    // 제출
    await page.getByRole('button', { name: /약속 만들기/ }).click()

    // 이동 확인 (Supabase mock이 만든 약속 ID로 이동)
    await expect(page).toHaveURL(/\/appointment\/apt-/)

    // InviteShare 모달 노출 + 초대 코드 표시
    const createdCode = supabase.state.appointments.at(-1)!.invite_code
    await expect(page.getByText(createdCode, { exact: true })).toBeVisible()

    // 세션이 localStorage에 저장됐는지
    const stored = await page.evaluate(() => localStorage.getItem('latemate_session_key'))
    expect(stored).toBeTruthy()
  })
})
