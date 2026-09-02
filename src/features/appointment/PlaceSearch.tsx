import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import { searchPlaces, type KakaoPlace } from '@/lib/api/kakaoLocal'
import { cn } from '@/utils/cn'

interface SelectedPlace {
  name: string
  lat: number
  lng: number
}

interface PlaceSearchProps {
  value: SelectedPlace | null
  onChange: (place: SelectedPlace | null) => void
  error?: string
}

export default function PlaceSearch({ value, onChange, error }: PlaceSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<KakaoPlace[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!query.trim()) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const places = await searchPlaces(query)
        setResults(places)
        setOpen(places.length > 0)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    if (!value.trim()) {
      setResults([])
      setOpen(false)
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(place: KakaoPlace) {
    onChange({ name: place.place_name, lat: parseFloat(place.y), lng: parseFloat(place.x) })
    setQuery('')
    setOpen(false)
  }

  function handleClear() {
    onChange(null)
    setQuery('')
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 h-12 px-4 rounded-2xl bg-brand-50 border border-brand-200">
        <MapPin size={16} strokeWidth={1.5} className="text-brand-600 flex-shrink-0" />
        <span className="flex-1 text-sm font-medium text-brand-700 truncate">{value.name}</span>
        <button
          onClick={handleClear}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-brand-400 hover:text-brand-600"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search
          size={16}
          strokeWidth={1.5}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="장소 검색"
          className={cn(
            'h-12 pl-10 pr-4 w-full rounded-2xl border bg-white text-base outline-none transition-colors',
            'border-gray-200 placeholder:text-gray-400',
            'focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
            error && 'border-status-late',
          )}
        />
        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        )}
      </div>

      {open && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-2xl shadow-float border border-gray-100 overflow-hidden max-h-52 overflow-y-auto">
          {results.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                onClick={() => handleSelect(place)}
                className="w-full flex flex-col px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">{place.place_name}</span>
                <span className="text-xs text-gray-400 mt-0.5 truncate">
                  {place.road_address_name || place.address_name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1.5 text-xs text-status-late">{error}</p>}
    </div>
  )
}
