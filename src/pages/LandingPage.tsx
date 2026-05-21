import { useToast } from '@/hooks/useToast';
import { fetchAppointmentByCode } from '@/lib/api/appointments';
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Clock,
  MapPin,
  Navigation,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className='relative mx-auto'
      style={{
        width: 220,
        filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.25))',
      }}
    >
      <div
        className='relative bg-gray-800 rounded-[42px] overflow-visible'
        style={{ aspectRatio: '9 / 19.5' }}
      >
        {/* Side buttons */}
        <div className='absolute -left-2 top-[22%] w-2 h-7 bg-gray-700 rounded-l-md' />
        <div className='absolute -left-2 top-[31%] w-2 h-11 bg-gray-700 rounded-l-md' />
        <div className='absolute -left-2 top-[43%] w-2 h-11 bg-gray-700 rounded-l-md' />
        <div className='absolute -right-2 top-[30%] w-2 h-14 bg-gray-700 rounded-r-md' />

        {/* Screen inset */}
        <div className='absolute inset-[7px] bg-white rounded-[36px] overflow-hidden'>
          {/* Dynamic island */}
          <div className='absolute top-2.5 left-1/2 -translate-x-1/2 w-17 h-5.5 bg-gray-900 rounded-full z-30' />
          {/* Status bar */}
          <div
            className='absolute top-0 inset-x-0 flex items-center justify-between px-5 z-20'
            style={{ height: 44 }}
          >
            <span className='text-[10px] font-semibold text-gray-800'>
              9:41
            </span>
            <div className='flex items-center gap-1'>
              <svg width='14' height='10' viewBox='0 0 14 10' fill='none'>
                <rect
                  x='0'
                  y='4'
                  width='2.5'
                  height='6'
                  rx='0.5'
                  fill='#1f2937'
                />
                <rect
                  x='3.5'
                  y='2.5'
                  width='2.5'
                  height='7.5'
                  rx='0.5'
                  fill='#1f2937'
                />
                <rect
                  x='7'
                  y='1'
                  width='2.5'
                  height='9'
                  rx='0.5'
                  fill='#1f2937'
                />
                <rect
                  x='10.5'
                  y='0'
                  width='2.5'
                  height='10'
                  rx='0.5'
                  fill='#1f2937'
                  opacity='0.3'
                />
              </svg>
              <div className='flex items-center'>
                <div className='w-[22px] h-[11px] border-[1.5px] border-gray-700 rounded-[3px] flex items-center px-[2px]'>
                  <div className='h-[5px] w-[14px] bg-gray-800 rounded-[1px]' />
                </div>
                <div className='w-[2px] h-[5px] bg-gray-600 rounded-r-sm ml-px' />
              </div>
            </div>
          </div>
          {/* Content */}
          <div className='absolute inset-0 top-11 overflow-hidden'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatScreen() {
  return (
    <div className='h-full flex flex-col bg-[#bacde0]'>
      {/* Header */}
      <div className='bg-[#f6f6f6] flex items-center gap-2 px-3 py-2 border-b border-gray-200 shrink-0'>
        <span className='text-[11px] text-gray-400'>‹</span>
        <div className='w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-[7px] font-bold text-yellow-900'>
          3
        </div>
        <div>
          <p className='text-[9px] font-bold text-gray-800 leading-none'>
            이번 주 약속
          </p>
          <p className='text-[7px] text-gray-400 leading-none mt-0.5'>5명</p>
        </div>
      </div>
      {/* Messages */}
      <div className='flex-1 flex flex-col gap-1.5 p-2.5 overflow-hidden justify-end'>
        <div className='self-end bg-[#fee500] rounded-2xl rounded-tr-none px-2.5 py-1.5'>
          <p className='text-[9px] text-gray-800'>오늘 몇시에 만나?</p>
        </div>
        <div className='flex items-end gap-1 self-start'>
          <div className='w-5 h-5 rounded-full bg-pink-400 shrink-0' />
          <div className='bg-white rounded-2xl rounded-tl-none px-2.5 py-1.5'>
            <p className='text-[9px] text-gray-800'>지금 어디야? 🙄</p>
          </div>
        </div>
        <div className='self-end bg-[#fee500] rounded-2xl rounded-tr-none px-2.5 py-1.5'>
          <p className='text-[9px] text-gray-800'>출발함~</p>
        </div>
        <div className='flex items-end gap-1 self-start'>
          <div className='w-5 h-5 rounded-full bg-blue-400 shrink-0' />
          <div className='bg-white rounded-2xl rounded-tl-none px-2.5 py-1.5'>
            <p className='text-[9px] text-gray-800'>얼마나 걸려? ㅠ</p>
          </div>
        </div>
        <div className='flex items-end gap-1 self-start'>
          <div className='w-5 h-5 rounded-full bg-pink-400 shrink-0' />
          <div className='bg-white rounded-2xl rounded-tl-none px-2.5 py-1.5'>
            <p className='text-[9px] text-gray-800'>야 빨리 와 ㅠㅠ</p>
          </div>
        </div>
        <div className='self-end bg-[#fee500] rounded-2xl rounded-tr-none px-2.5 py-1.5'>
          <p className='text-[9px] text-gray-800'>미안 5분만요... ㅠ</p>
        </div>
      </div>
      {/* Input */}
      <div className='bg-[#f6f6f6] flex items-center gap-1.5 px-2.5 py-1.5 shrink-0'>
        <div className='flex-1 bg-white rounded-full h-6 px-2.5 flex items-center'>
          <span className='text-[7px] text-gray-400'>메시지 입력</span>
        </div>
        <div className='w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center'>
          <span className='text-white text-[8px] leading-none'>▶</span>
        </div>
      </div>
    </div>
  );
}

function MapScreen() {
  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='bg-white flex flex-col items-center px-3 py-2 shadow-sm shrink-0'>
        <p className='text-[10px] font-bold text-gray-900'>강남역 만남</p>
        <p className='text-[8px] text-brand-500 mt-0.5'>
          오늘 18:00 · 강남역 1번 출구
        </p>
      </div>
      {/* Map */}
      <div className='flex-1 relative overflow-hidden bg-[#e8f0e9]'>
        {/* Roads */}
        <div
          className='absolute left-0 right-0 h-2.5 bg-white opacity-60'
          style={{ top: '44%' }}
        />
        <div
          className='absolute top-0 bottom-0 w-2.5 bg-white opacity-60'
          style={{ left: '46%' }}
        />
        {/* Grid */}
        {[15, 30, 60, 78].map((p) => (
          <div
            key={p}
            className='absolute left-0 right-0 border-t border-[#d0e6d0] opacity-60'
            style={{ top: `${p}%` }}
          />
        ))}
        {[22, 65].map((p) => (
          <div
            key={p}
            className='absolute top-0 bottom-0 border-l border-[#d0e6d0] opacity-60'
            style={{ left: `${p}%` }}
          />
        ))}
        {/* Green patches */}
        <div
          className='absolute w-10 h-8 bg-green-200 rounded-lg opacity-80'
          style={{ top: '8%', left: '8%' }}
        />
        <div
          className='absolute w-8 h-9 bg-green-200 rounded-lg opacity-80'
          style={{ bottom: '12%', right: '8%' }}
        />

        {/* Destination pin */}
        <div
          className='absolute z-20 -translate-x-1/2 -translate-y-full'
          style={{ top: '45%', left: '50%' }}
        >
          <div className='w-7 h-7 rounded-full bg-brand-600 border-2 border-white shadow-lg flex items-center justify-center'>
            <MapPin size={12} className='text-white' strokeWidth={2.5} />
          </div>
          <div className='w-2 h-2 bg-brand-600 rounded-full mx-auto -mt-1 opacity-40 blur-[1px]' />
        </div>

        {/* Participant markers */}
        <div className='absolute z-10' style={{ top: '18%', left: '14%' }}>
          <div className='bg-emerald-500 text-white text-[7px] font-bold rounded-full px-2 py-1 shadow-md whitespace-nowrap flex items-center gap-1'>
            <div className='w-1.5 h-1.5 rounded-full bg-white' />
            준영 · 2분
          </div>
        </div>
        <div className='absolute z-10' style={{ top: '62%', left: '58%' }}>
          <div className='bg-red-500 text-white text-[7px] font-bold rounded-full px-2 py-1 shadow-md whitespace-nowrap flex items-center gap-1'>
            <div className='w-1.5 h-1.5 rounded-full bg-white' />
            지수 · 15분
          </div>
        </div>
        <div className='absolute z-10' style={{ top: '28%', left: '65%' }}>
          <div className='bg-emerald-500 text-white text-[7px] font-bold rounded-full px-2 py-1 shadow-md whitespace-nowrap flex items-center gap-1'>
            <div className='w-1.5 h-1.5 rounded-full bg-white' />
            민준 · 6분
          </div>
        </div>
      </div>
      {/* Bottom sheet */}
      <div className='bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)] shrink-0 px-3 pt-2 pb-3 rounded-t-2xl'>
        <div className='w-8 h-1 bg-gray-200 rounded-full mx-auto mb-2' />
        {[
          { name: '준영', eta: '2분', late: false },
          { name: '지수', eta: '15분', late: true },
          { name: '민준', eta: '6분', late: false },
        ].map((p) => (
          <div
            key={p.name}
            className='flex items-center justify-between py-[3px]'
          >
            <div className='flex items-center gap-1.5'>
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ${p.late ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}
              >
                {p.name[0]}
              </div>
              <span className='text-[9px] font-semibold text-gray-800'>
                {p.name}
              </span>
            </div>
            <span
              className={`text-[7px] rounded-full px-2 py-0.5 font-semibold ${p.late ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}
            >
              {p.late ? '지각 예상' : '정시 예상'} · {p.eta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const bottomCtaRef = useRef<HTMLElement>(null);
  const bottomCtaInView = useRef(false);

  const isCodeValid = /^[A-Za-z0-9]{6}$/.test(code);

  useEffect(() => {
    const onScroll = () =>
      setShowStickyBar(window.scrollY > 500 && !bottomCtaInView.current);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = bottomCtaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        bottomCtaInView.current = e.isIntersecting;
        setShowStickyBar(window.scrollY > 500 && !e.isIntersecting);
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  async function handleJoinByCode() {
    if (!isCodeValid) return;
    setLoading(true);
    try {
      const appointment = await fetchAppointmentByCode(code);
      navigate(`/join/${appointment.id}`);
    } catch {
      toast.error('존재하지 않는 초대 코드예요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex flex-col'>
      {/* ── Hero ── */}
      <section className='min-h-dvh flex flex-col bg-white px-6 pt-14 pb-8 relative overflow-hidden'>
        {/* BG blobs */}
        <div className='absolute -top-24 -right-24 w-72 h-72 bg-brand-50 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -bottom-12 -left-12 w-52 h-52 bg-indigo-50 rounded-full blur-3xl pointer-events-none' />

        {/* Logo */}
        <div className='relative z-10 flex items-center gap-2.5'>
          <img
            src='/app-icon-192.svg'
            alt='LateMate'
            className='w-9 h-9 rounded-xl object-cover shrink-0'
          />
          <span className='text-lg font-bold text-brand-700 tracking-tight'>
            LateMate
          </span>
        </div>

        {/* Main content */}
        <div className='relative z-10 flex-1 flex flex-col justify-center py-8'>
          <h1 className='text-[52px] font-black text-gray-900 leading-[1.05] tracking-tight mb-5'>
            지각하지
            <br />
            말자,
            <br />
            <span className='text-brand-600'>함께</span>
          </h1>
          <p className='text-[15px] text-gray-500 leading-relaxed mb-10'>
            실시간 위치 공유로
            <br />
            "지금 어디야?" 없이 약속을 지켜요.
          </p>

          <button
            onClick={() => navigate('/create')}
            className='w-full h-14 rounded-2xl bg-brand-600 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform mb-4'
          >
            약속 만들기
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>

          <div className='flex items-center gap-3 mb-3'>
            <div className='flex-1 h-px bg-gray-100' />
            <span className='text-xs text-gray-400'>또는 코드로 참여</span>
            <div className='flex-1 h-px bg-gray-100' />
          </div>

          <div className='flex gap-2'>
            <input
              type='text'
              value={code}
              maxLength={6}
              placeholder='초대 코드 6자리'
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinByCode()}
              className='flex-1 h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 text-center text-sm font-mono tracking-[0.3em] uppercase outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:tracking-normal placeholder:font-sans placeholder:text-xs'
            />
            <button
              onClick={handleJoinByCode}
              disabled={!isCodeValid || loading}
              className='h-12 px-5 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm shrink-0 disabled:opacity-40 active:scale-95 transition-transform'
            >
              {loading ? '…' : '참여'}
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div className='relative z-10 flex justify-center'>
          <ChevronDown
            size={24}
            strokeWidth={1.5}
            className='text-gray-400 opacity-35 animate-bounce'
          />
        </div>
      </section>

      {/* ── Problem ── */}
      <section className='bg-brand-600 px-6 py-16 relative overflow-hidden'>
        <div className='absolute -top-24 -right-24 w-64 h-64 bg-brand-500 rounded-full blur-3xl opacity-50 pointer-events-none' />
        <div className='absolute -bottom-16 -left-16 w-52 h-52 bg-indigo-500 rounded-full blur-3xl opacity-30 pointer-events-none' />

        <FadeUp className='relative z-10 mb-10'>
          <h2 className='text-[26px] font-black text-white leading-tight mb-3'>
            "지금 어디야?"
            <br />
            매번 보내고 있지 않으세요?
          </h2>
          <p className='text-brand-200 text-sm leading-relaxed'>
            반복되는 메시지, 기다리는 스트레스.
            <br />
            이제 그만해요.
          </p>
        </FadeUp>

        <FadeUp delay={150} className='relative z-10'>
          <div className='animate-float'>
            <PhoneFrame>
              <ChatScreen />
            </PhoneFrame>
          </div>
        </FadeUp>
      </section>

      {/* ── App Preview ── */}
      <section className='bg-white px-6 py-16 relative overflow-hidden'>
        <div className='absolute -top-20 -left-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-70 pointer-events-none' />

        <FadeUp className='relative z-10 mb-10'>
          <h2 className='text-[26px] font-black text-gray-900 leading-tight mb-3'>
            실시간 지도로
            <br />
            <span className='text-brand-600'>한눈에 확인</span>
          </h2>
          <p className='text-gray-500 text-sm leading-relaxed'>
            누가 얼마나 늦는지, 지각 예상인지
            <br />
            지도와 배지로 즉시 파악해요.
          </p>
        </FadeUp>

        <FadeUp delay={150} className='relative z-10'>
          <div className='animate-float-slow'>
            <PhoneFrame>
              <MapScreen />
            </PhoneFrame>
          </div>
        </FadeUp>
      </section>

      {/* ── Features ── */}
      <section className='bg-gray-50 px-6 py-16'>
        <FadeUp>
          <h2 className='text-[26px] font-black text-gray-900 mb-8 text-center'>
            핵심 기능
          </h2>
        </FadeUp>
        <div className='flex flex-col gap-3'>
          {[
            {
              icon: <Navigation size={22} strokeWidth={1.5} />,
              bg: 'bg-brand-50',
              color: 'text-brand-600',
              title: '실시간 위치 공유',
              desc: '버튼 하나로 시작. 7초마다 위치가 지도에 갱신돼요.',
            },
            {
              icon: <Clock size={22} strokeWidth={1.5} />,
              bg: 'bg-emerald-50',
              color: 'text-emerald-600',
              title: 'ETA 자동 계산',
              desc: '카카오 길찾기 기반으로 도착 예상 시간을 30초마다 계산해요.',
            },
            {
              icon: <AlertCircle size={22} strokeWidth={1.5} />,
              bg: 'bg-red-50',
              color: 'text-red-500',
              title: '지각 예상 알림',
              desc: 'ETA가 약속 시각을 넘으면 자동으로 지각 예상 배지를 표시해요.',
            },
          ].map((f, i) => (
            <FadeUp key={f.title} delay={i * 100}>
              <div className='bg-white rounded-2xl px-4 py-5 shadow-sm flex items-start gap-4'>
                <div
                  className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center ${f.bg} ${f.color}`}
                >
                  {f.icon}
                </div>
                <div>
                  <p className='text-[15px] font-bold text-gray-900 mb-1'>
                    {f.title}
                  </p>
                  <p className='text-sm text-gray-500 leading-relaxed'>
                    {f.desc}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className='bg-white px-6 py-16'>
        <FadeUp>
          <h2 className='text-[26px] font-black text-gray-900 mb-10 text-center'>
            3단계로 끝
          </h2>
        </FadeUp>
        <div className='flex flex-col'>
          {[
            {
              step: '01',
              title: '약속 만들기',
              desc: '제목, 장소, 시간을 입력해 약속을 생성해요.',
            },
            {
              step: '02',
              title: '링크 공유',
              desc: '카톡으로 1초 전송. 친구들이 클릭만 하면 돼요.',
            },
            {
              step: '03',
              title: '실시간 확인',
              desc: '지도에서 모두의 위치와 도착 예정 시간을 확인해요.',
            },
          ].map((s, i) => (
            <FadeUp key={s.step} delay={i * 120}>
              <div className='flex gap-5 mb-8 last:mb-0'>
                <div className='flex flex-col items-center'>
                  <div className='w-10 h-10 rounded-2xl bg-brand-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-md'>
                    {s.step}
                  </div>
                  {i < 2 && (
                    <div
                      className='w-px flex-1 mt-2 min-h-8'
                      style={{
                        background:
                          'linear-gradient(to bottom, #c7d2fe, transparent)',
                      }}
                    />
                  )}
                </div>
                <div className='pt-1.5'>
                  <p className='text-[15px] font-bold text-gray-900 mb-1'>
                    {s.title}
                  </p>
                  <p className='text-sm text-gray-500 leading-relaxed'>
                    {s.desc}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        ref={bottomCtaRef}
        className='px-6 py-16 text-center relative overflow-hidden'
        style={{ background: 'linear-gradient(135deg, #4F46E5, #4338CA)' }}
      >
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            background:
              'radial-gradient(ellipse at top right, rgba(99,102,241,0.6), transparent 60%)',
          }}
        />
        <FadeUp className='relative z-10'>
          <p className='text-brand-200 text-sm mb-2'>회원가입 없이 바로 시작</p>
          <h2 className='text-[28px] font-black text-white mb-2'>
            30초면 충분해요
          </h2>
          <p className='text-brand-200 text-sm mb-8'>
            실시간 위치 공유, 지금 바로 시작해요.
          </p>
          <button
            onClick={() => navigate('/create')}
            className='w-full h-14 rounded-2xl bg-white text-brand-700 font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-transform'
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
          >
            약속 만들기
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>
        </FadeUp>
      </section>

      {/* ── Sticky CTA ── */}
      <div
        className='fixed bottom-0 left-0 right-0 z-50 flex justify-center'
        style={{
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          opacity: showStickyBar ? 1 : 0,
          transform: showStickyBar ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
          pointerEvents: showStickyBar ? 'auto' : 'none',
        }}
      >
        <div className='w-full max-w-107.5 px-4'>
          <button
            onClick={() => navigate('/create')}
            className='w-full h-14 rounded-2xl bg-brand-600 text-white font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-transform'
            style={{ boxShadow: '0 8px 32px rgba(79,70,229,0.5)' }}
          >
            약속 만들기
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
