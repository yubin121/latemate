import { describe, it, expect } from 'vitest'
import { subjectParticle } from './korean'

describe('subjectParticle', () => {
  it('마지막 글자에 받침이 있으면 "이"를 반환한다 — "민준" (준의 종성 ㄴ)', () => {
    expect(subjectParticle('민준')).toBe('이')
  })

  it('마지막 글자에 받침이 없으면 "가"를 반환한다 — "지수" (수는 종성 없음)', () => {
    expect(subjectParticle('지수')).toBe('가')
  })

  it('한 글자 이름도 종성으로 판정한다 — "김" (ㅁ 받침)', () => {
    expect(subjectParticle('김')).toBe('이')
  })

  it('첫 글자에 받침이 있어도 마지막 글자만 본다 — "철수" (철=ㄹ 받침, 수=받침 없음 → "가")', () => {
    expect(subjectParticle('철수')).toBe('가')
  })

  it('빈 문자열은 crash 없이 "가"를 반환한다', () => {
    expect(subjectParticle('')).toBe('가')
  })

  it('ASCII 이름은 crash 없이 "가"를 반환한다 (유니코드 한글 범위 밖)', () => {
    expect(subjectParticle('Anna')).toBe('가')
  })

  it('마지막이 특수문자면 "가"를 반환한다 — "민준!"의 !는 한글 아님', () => {
    expect(subjectParticle('민준!')).toBe('가')
  })
})
