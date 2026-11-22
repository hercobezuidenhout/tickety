import { useEffect, useState } from 'react'

const formatMs = (ms: number) => {
  const secs = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
}

const useNow = () => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

type Props = { since: number; durationMs: number; className?: string }

export default function Countdown({ since, durationMs, className }: Props) {
  const now = useNow()
  return <span className={className}>{formatMs(since + durationMs - now)}</span>
}
