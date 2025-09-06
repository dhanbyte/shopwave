'use client'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

type Address = {
  id: string
  fullName: string
  phone: string
  pincode: string
  line1: string
  line2: string
  city: string
  state: string
  landmark: string
  default: boolean
}

const required = (s?: string) => !!(s && s.trim().length)

export default function AddressForm({ action, initial, onCancel }: { action: (a: Omit<Address, 'id'>) => void; initial?: Partial<Address>; onCancel?: () => void }) {
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()
  
  // Controlled form state
  const [formData, setFormData] = useState({
    fullName: initial?.fullName || '',
    phone: initial?.phone || '',
    pincode: initial?.pincode || '',
    line1: initial?.line1 || '',
    line2: initial?.line2 || '',
    city: initial?.city || '',
    state: initial?.state || '',
    landmark: initial?.landmark || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const a: Omit<Address, 'id'> = {
        ...formData,
        fullName: formData.fullName.trim(),
        phone: formData.phone.replace(/\s/g, ''),
        pincode: formData.pincode.trim(),
        line1: formData.line1.trim(),
        line2: formData.line2?.trim() || '',
        city: formData.city.trim(),
        state: formData.state.trim(),
        landmark: formData.landmark?.trim() || '',
        default: initial?.default || false,
    }

    const newErrors: Record<string, string> = {}
    if (!required(a.fullName)) newErrors.fullName = "Full name is required."
    if (!/^[0-9]{10}$/.test(a.phone)) newErrors.phone = "Must be a valid 10-digit phone number."
    if (!/^[0-9]{6}$/.test(a.pincode)) newErrors.pincode = "Must be a 6-digit pincode."
    if (!required(a.line1)) newErrors.line1 = "Building/Floor is required."
    if (!required(a.city)) newErrors.city = "City is required."
    if (!required(a.state)) newErrors.state = "State is required."
    
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        await action(a)
        toast({
          title: "Address Saved",
          description: "Your address has been saved successfully.",
        })
      } catch (error) {
        console.error('Address save error:', error)
        toast({
          title: "Error",
          description: "Failed to save address. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const InputField = ({ name, placeholder, error, type = 'text' }: { name: string, placeholder: string, error?: string, type?: string }) => (
    <div>
      <input 
        className={`w-full rounded-lg border px-3 py-2 text-sm ${error ? 'border-red-500' : 'border-gray-300'}`} 
        placeholder={placeholder} 
        name={name}
        value={formData[name as keyof typeof formData]}
        onChange={(e) => setFormData(prev => ({ ...prev, [name]: e.target.value }))}
        type={type} 
      />
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  )

  return (
    <form key={initial?.id || 'new'} onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <InputField name="fullName" placeholder="Full Name*" error={errors.fullName} />
        <InputField name="phone" placeholder="Phone*" error={errors.phone} type="tel" />
        <InputField name="pincode" placeholder="Pincode (6 digits)*" error={errors.pincode} type="number" />
        <InputField name="city" placeholder="City*" error={errors.city} />
        <div className="md:col-span-2">
          <InputField name="line1" placeholder="Building/Floor*" error={errors.line1} />
        </div>
        <div className="md:col-span-2">
          <InputField name="line2" placeholder="Street/Area (optional)" />
        </div>
        <InputField name="state" placeholder="State*" error={errors.state} />
        <InputField name="landmark" placeholder="Landmark (optional)" />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-50">Save Address</button>
        {onCancel && <button type="button" onClick={onCancel} className="rounded-xl border px-5 py-2 text-sm font-semibold">Cancel</button>}
      </div>
    </form>
  )
}