export default function PriceTag({ original, discounted, currency = '₹' }: { original: number; discounted?: number; currency?: string }) {
  const safeOriginal = original || 0
  const safeDiscounted = discounted || 0
  const price = safeDiscounted || safeOriginal
  const off = safeDiscounted ? Math.round(((safeOriginal - safeDiscounted) / safeOriginal) * 100) : 0
  const savings = safeDiscounted ? safeOriginal - safeDiscounted : 0;

  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className="text-lg font-semibold">{currency}{price.toLocaleString('en-IN')}</span>
      {safeDiscounted && (
        <>
          <span className="text-sm text-gray-400 line-through">{currency}{safeOriginal.toLocaleString('en-IN')}</span>
          <span className="text-xs font-medium text-green-600">
            {off}% off (Save {currency}{savings.toLocaleString('en-IN')})
          </span>
        </>
      )}
    </div>
  )
}
