'use client'
import { useState, useRef } from 'react'
import type { Address } from '@/lib/types'

const required = (s?: string) => !!(s && s.trim().length)

export default function AddressForm({ onSubmit, initial, onCancel }: { onSubmit: (a: Omit<Address, 'id'>) => void; initial?: Partial<Address>; onCancel?: () => void }) {
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formRef.current) return

    const formData = new FormData(formRef.current)
    const a: Omit<Address, 'id'> = {
        fullName: formData.get('fullName') as string || '',
        phone: formData.get('phone') as string || '',
        pincode: formData.get('pincode') as string || '',
        line1: formData.get('line1') as string || '',
        line2: formData.get('line2') as string || '',
        city: formData.get('city') as string || '',
        state: formData.get('state') as string || '',
        landmark: formData.get('landmark') as string || '',
        default: true,
    }

    const newErrors: Record<string, string> = {}
    if (!required(a.fullName)) newErrors.fullName = "Full name is required."
    if (!/^[0-9]{10}$/.test(a.phone.replace(/\s/g, ''))) newErrors.phone = "Must be a valid 10-digit phone number."
    if (!/^[0-9]{6}$/.test(a.pincode)) newErrors.pincode = "Must be a 6-digit pincode."
    if (!required(a.line1)) newErrors.line1 = "Building/Floor is required."
    if (!required(a.city)) newErrors.city = "City is required."
    if (!required(a.state)) newErrors.state = "State is required."
    
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSubmit(a)
    }
  }

  const InputField = ({ name, placeholder, defaultValue, error, type = 'text' }: { name: string, placeholder: string, defaultValue?: string, error?: string, type?: string }) => (
    <div>
      <input 
        className={`w-full rounded-lg border px-3 py-2 text-sm ${error ? 'border-red-500' : 'border-gray-300'}`} 
        placeholder={placeholder} 
        name={name}
        defaultValue={defaultValue}
        type={type} 
      />
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  )

  return (
    <form key={initial?.id || 'new'} ref={formRef} onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <InputField name="fullName" placeholder="Full Name*" defaultValue={initial?.fullName} error={errors.fullName} />
        <InputField name="phone" placeholder="Phone*" defaultValue={initial?.phone} error={errors.phone} type="tel" />
        <InputField name="pincode" placeholder="Pincode (6 digits)*" defaultValue={initial?.pincode} error={errors.pincode} type="number" />
        <InputField name="city" placeholder="City*" defaultValue={initial?.city} error={errors.city} />
        <div className="md:col-span-2">
          <InputField name="line1" placeholder="Building/Floor*" defaultValue={initial?.line1} error={errors.line1} />
        </div>
        <div className="md:col-span-2">
          <InputField name="line2" placeholder="Street/Area (optional)" defaultValue={initial?.line2} />
        </div>
        <InputField name="state" placeholder="State*" defaultValue={initial?.state} error={errors.state} />
        <InputField name="landmark" placeholder="Landmark (optional)" defaultValue={initial?.landmark} />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-50">Save Address</button>
        {onCancel && <button type="button" onClick={onCancel} className="rounded-xl border px-5 py-2 text-sm font-semibold">Cancel</button>}
      </div>
    </form>
  )
}