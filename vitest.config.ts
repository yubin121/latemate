import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    env: {
      TZ: 'Asia/Seoul',
      // 유닛 테스트는 supabase를 직접 호출하지 않지만, lib/supabase.ts가 모듈 로드 시
      // createClient(url, key)를 호출하므로 유효한 placeholder가 필요하다. .env.local 값을
      // 덮어쓰지 않도록 실제 URL로는 절대 도달할 수 없는 도메인을 사용한다.
      VITE_SUPABASE_URL: 'https://vitest.supabase.invalid',
      VITE_SUPABASE_ANON_KEY: 'vitest-anon-key',
    },
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
