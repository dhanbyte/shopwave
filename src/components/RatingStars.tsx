import { Star } from 'lucide-react'
export default function RatingStars({ value = 0 }: { value?: number }) {
  const safeValue = typeof value === 'number' ? value : 0
  const full = Math.round(safeValue)
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${safeValue} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < full ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-gray-300'}`} />
      ))}
      <span className="ml-1 text-xs text-gray-500">{safeValue.toFixed(1)}</span>
    </div>
  )
}
