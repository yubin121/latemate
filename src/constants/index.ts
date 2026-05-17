/** 목적지 도착 판정 반경 (미터) */
export const ARRIVAL_RADIUS_M = 100

/** 참여자 위치 polling 간격 (ms) */
export const POLLING_INTERVAL = 7_000

/** ETA 계산 interval (ms) */
export const ETA_INTERVAL = 30_000

/** 위치 업로드 최소 이동 거리 (미터) */
export const MIN_UPLOAD_DISTANCE_M = 10

/** 위치 업로드 최대 시간 간격 (ms) — 이 시간 이상 경과 시 거리와 무관하게 업로드 */
export const MAX_UPLOAD_INTERVAL_MS = 10_000

/** 지각 판단 버퍼 시간 (ms) — 약속 시간 + 이 값 이내면 정시로 판단 */
export const LATE_BUFFER_MS = 5 * 60 * 1000
