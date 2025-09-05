
'use client'
import { useState } from 'react'
import { useAddressBook } from '@/lib/addressStore'
import type { Address } from '@/lib/types'
import AddressForm from './AddressForm'
import { useAuth } from '@/context/ClerkAuthContext'

export default function AddressManager({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const { addresses, save, setDefault, remove } = useAddressBook()
  const [showForm, setShowForm] = useState(addresses.length === 0)
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined)

  const handleSaveAddress = async (addr: Omit<Address, 'id'>) => {
    if (user) {
      await save(user.id, { ...editingAddress, ...addr });
      setShowForm(false);
      setEditingAddress(undefined);
    }
  }
  
  const handleSetDefault = async (addressId: string) => {
    if (user) {
        await setDefault(user.id, addressId);
    }
  }

  const handleRemove = async (addressId: string) => {
    if (user) {
        await remove(user.id, addressId);
    }
  }

  const handleEdit = (e: React.MouseEvent, addr: Address) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setShowForm(true);
  }

  return (
    <div>
        <button onClick={onBack} className="text-sm text-brand font-semibold mb-4">&larr; Back to Account</button>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Addresses</h2>
            {!showForm && <button onClick={() => { setEditingAddress(undefined); setShowForm(true); }} className="text-sm font-semibold text-brand hover:underline">+ Add New Address</button>}
        </div>

        {!showForm ? (
            <div className="space-y-3">
              {addresses.map((a) => (
                <div key={a.id} className="rounded-xl border p-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-semibold text-sm">{a.fullName} — {a.phone}</div>
                            <div className="text-sm text-gray-600">{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} - {a.pincode}</div>
                            {a.landmark && <div className="text-xs text-gray-500">Landmark: {a.landmark}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                             {!a.default && <button onClick={(e) => { e.stopPropagation(); a.id && handleSetDefault(a.id); }} className="text-xs font-semibold text-gray-500 hover:text-brand">Set Default</button>}
                             <button onClick={(e) => handleEdit(e, a)} className="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                             <button onClick={(e) => { e.stopPropagation(); a.id && handleRemove(a.id); }} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                        </div>
                    </div>

                  {a.default && <div className="mt-2 text-xs font-bold text-green-600">Default Address</div>}
                </div>
              ))}
              {addresses.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No addresses saved yet.</p>}
            </div>
          ) : (
            <div className="card p-4">
              <AddressForm 
                onSubmit={handleSaveAddress} 
                initial={editingAddress} 
                onCancel={() => { setShowForm(false); setEditingAddress(undefined); }} 
              />
            </div>
          )}
    </div>
  )
}
