import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('on_time은 "정시" 텍스트를 렌더한다', () => {
    render(<StatusBadge status="on_time" />)
    expect(screen.getByText('정시')).toBeInTheDocument()
  })

  it('late는 "지각" 텍스트를 렌더한다', () => {
    render(<StatusBadge status="late" />)
    expect(screen.getByText('지각')).toBeInTheDocument()
  })

  it('arrived는 "도착" 텍스트를 렌더한다', () => {
    render(<StatusBadge status="arrived" />)
    expect(screen.getByText('도착')).toBeInTheDocument()
  })

  it('unknown은 "미확인" 텍스트를 렌더한다 (매핑 누락 시 crash 방지)', () => {
    render(<StatusBadge status="unknown" />)
    expect(screen.getByText('미확인')).toBeInTheDocument()
  })
})
