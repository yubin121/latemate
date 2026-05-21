/** 마지막 글자에 받침이 있으면 true */
function hasBatchim(str: string): boolean {
  if (!str) return false
  const code = str.charCodeAt(str.length - 1)
  if (code < 0xac00 || code > 0xd7a3) return false
  return (code - 0xac00) % 28 !== 0
}

/** 이름 뒤에 붙는 주격 조사 "이/가" 반환 */
export function subjectParticle(name: string): string {
  return hasBatchim(name) ? '이' : '가'
}
