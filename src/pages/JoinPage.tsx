import Button from '@/components/ui/Button';
import { JoinPageSkeleton } from '@/components/ui/Skeleton';
import { useAppointment } from '@/hooks/useAppointment';
import { useJoinAppointment } from '@/hooks/useJoinAppointment';
import { restoreSession } from '@/lib/api/participants';
import { useSessionStore } from '@/stores/sessionStore';
import { cn } from '@/utils/cn';
import { formatHHMM } from '@/utils/formatTime';
import { Clock, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SESSION_KEY_STORAGE = 'latemate_session_key';

export default function JoinPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const setSession = useSessionStore((s) => s.setSession);
  const {
    data: appointment,
    isLoading,
    isError,
  } = useAppointment(appointmentId!);
  const {
    mutate: join,
    isPending,
    error: joinError,
  } = useJoinAppointment(appointmentId!);

  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [restoring, setRestoring] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // 세션 복구 시도
  useEffect(() => {
    async function tryRestore() {
      const sessionKey = localStorage.getItem(SESSION_KEY_STORAGE);
      if (!sessionKey || !appointmentId) {
        setRestoring(false);
        return;
      }
      const session = await restoreSession(appointmentId, sessionKey);
      if (session) {
        setSession(session);
        navigate(`/appointment/${appointmentId}`, { replace: true });
      } else {
        setRestoring(false);
      }
    }
    tryRestore();
  }, [appointmentId, navigate, setSession]);

  useEffect(() => {
    if (!restoring) setTimeout(() => inputRef.current?.focus(), 100);
  }, [restoring]);

  // joinError 처리
  const errorMessage =
    joinError instanceof Error
      ? joinError.message
      : joinError
        ? '참여에 실패했어요.'
        : '';

  function handleJoin() {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setNicknameError('닉네임을 입력해주세요.');
      return;
    }
    setNicknameError('');
    join(trimmed);
  }

  if (restoring || isLoading) {
    return <JoinPageSkeleton />;
  }

  if (isError || !appointment) {
    return (
      <div className='flex flex-col items-center justify-center min-h-dvh px-6 gap-4'>
        <p className='text-base font-semibold text-gray-700'>
          약속을 찾을 수 없어요
        </p>
        <Button variant='secondary' onClick={() => navigate('/')}>
          홈으로 이동
        </Button>
      </div>
    );
  }

  const isExpired =
    appointment.expires_at && new Date(appointment.expires_at) < new Date();
  if (isExpired) {
    return (
      <div className='flex flex-col items-center justify-center min-h-dvh px-6 gap-4'>
        <p className='text-base font-semibold text-gray-700'>
          종료된 약속이에요
        </p>
        <Button variant='secondary' onClick={() => navigate('/')}>
          홈으로 이동
        </Button>
      </div>
    );
  }

  const scheduledDate = new Date(appointment.scheduled_at);
  const dateStr = scheduledDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
  const timeStr = formatHHMM(scheduledDate);

  return (
    <div className='flex flex-col min-h-dvh bg-surface-page'>
      <div className='flex-1 px-4 pt-8 pb-32'>
        {/* 약속 카드 */}
        <div className='bg-white rounded-2xl shadow-card overflow-hidden mb-5'>
          <div className='h-1 bg-brand-600' />
          <div className='p-5'>
            <h1 className='text-xl font-bold text-gray-900 mb-3'>
              {appointment.title}
            </h1>
            <div className='flex items-center gap-2 text-sm text-gray-500 mb-1.5'>
              <MapPin
                size={14}
                strokeWidth={1.5}
                className='text-brand-500 shrink-0'
              />
              <span>{appointment.place_name}</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <Clock
                size={14}
                strokeWidth={1.5}
                className='text-brand-500 shrink-0'
              />
              <span>
                {dateStr} {timeStr}
              </span>
            </div>
          </div>
        </div>

        {/* 닉네임 입력 */}
        <div className='bg-white rounded-2xl p-4 shadow-card'>
          <label className='block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2'>
            내 닉네임
          </label>
          <input
            ref={inputRef}
            type='text'
            value={nickname}
            maxLength={10}
            placeholder='최대 10자'
            onChange={(e) => {
              setNickname(e.target.value);
              setNicknameError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            className={cn(
              'h-12 px-4 w-full rounded-2xl border bg-gray-50 text-base outline-none transition-colors',
              'border-gray-200 placeholder:text-gray-400',
              'focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white',
              (nicknameError || errorMessage) && 'border-status-late',
            )}
          />
          {(nicknameError || errorMessage) && (
            <p className='mt-1.5 text-xs text-status-late'>
              {nicknameError || errorMessage}
            </p>
          )}
          <p className='mt-2 text-xs text-gray-400'>약속 안에서만 사용돼요</p>
        </div>
      </div>

      {/* 하단 고정 CTA */}
      <div className='fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-107.5 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] bg-white border-t border-gray-100'>
        <Button
          size='lg'
          className='w-full'
          loading={isPending}
          disabled={!nickname.trim()}
          onClick={handleJoin}
        >
          참여하기
        </Button>
      </div>
    </div>
  );
}
