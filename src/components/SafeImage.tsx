'use client'
import Image from 'next/image'

// A wrapper for next/image with fill and object-cover, making it easier to use in responsive layouts.
// The container div should be given size/aspect ratio classes.
export default function SafeImage({ src, alt, className, sizes = "(max-width: 768px) 50vw, 25vw" }: { src: string; alt: string; className?: string, sizes?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className ?? ''}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  )
}
