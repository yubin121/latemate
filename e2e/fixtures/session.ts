import type { Page } from '@playwright/test'

export interface PrimedSession {
  appointmentId: string
  participantId: string
  sessionKey: string
  nickname: string
  isHost: boolean
}

export async function primeSession(page: Page, session: PrimedSession) {
  await page.addInitScript((s) => {
    localStorage.setItem('latemate_session_key', s.sessionKey)
    localStorage.setItem(
      'latemate-session',
      JSON.stringify({
        state: {
          session: {
            appointmentId: s.appointmentId,
            participantId: s.participantId,
            sessionKey: s.sessionKey,
            nickname: s.nickname,
            isHost: s.isHost,
          },
        },
        version: 0,
      }),
    )
  }, session)
}
