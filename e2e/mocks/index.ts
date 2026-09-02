import type { Page } from '@playwright/test'
import { stubKakaoMaps } from './kakao'
import { installSupabaseMock, type SupabaseMock } from './supabase'

export async function setupMocks(page: Page): Promise<{ supabase: SupabaseMock }> {
  await stubKakaoMaps(page)
  const supabase = await installSupabaseMock(page)
  return { supabase }
}

export { stubKakaoMaps, installSupabaseMock }
export type { SupabaseMock } from './supabase'
