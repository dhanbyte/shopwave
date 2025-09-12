'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

type Coupon = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrder: number
  maxDiscount?: number
  expiryDate: string
  usageLimit: number
  usedCount: number
  isActive: boolean
  createdAt: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isFormOpen, setFormOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | undefined>()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minOrder: 0,
    maxDiscount: '',
    expiryDate: '',
    usageLimit: 100,
    isActive: true
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons')
      if (response.ok) {
        const data = await response.json()
        setCoupons(data)
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = selectedCoupon ? 'PUT' : 'POST'
      const url = selectedCoupon ? `/api/admin/coupons/${selectedCoupon.id}` : '/api/admin/coupons'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined
        })
      })

      if (response.ok) {
        toast({ title: selectedCoupon ? "Coupon Updated" : "Coupon Created", description: `${formData.code} has been ${selectedCoupon ? 'updated' : 'created'}.` })
        setFormOpen(false)
        resetForm()
        fetchCoupons()
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save coupon", variant: "destructive" })
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      maxDiscount: coupon.maxDiscount?.toString() || '',
      expiryDate: coupon.expiryDate.split('T')[0],
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive
    })
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: "Coupon Deleted", description: "Coupon has been deleted successfully." })
        fetchCoupons()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete coupon", variant: "destructive" })
    }
  }

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: "Copied!", description: `Coupon code ${code} copied to clipboard.` })
  }

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      minOrder: 0,
      maxDiscount: '',
      expiryDate: '',
      usageLimit: 100,
      isActive: true
    })
    setSelectedCoupon(undefined)
  }

  const generateCouponCode = () => {
    const code = 'SAVE' + Math.random().toString(36).substr(2, 6).toUpperCase()
    setFormData(prev => ({ ...prev, code }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Coupons</h1>
          <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { setFormOpen(false); resetForm(); } else { setFormOpen(true); } }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  required
                />
                <Button type="button" onClick={generateCouponCode} variant="outline" size="sm">
                  Generate
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {formData.type === 'percentage' ? 'Percentage' : 'Amount'} *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    min="0"
                    max={formData.type === 'percentage' ? "100" : undefined}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, minOrder: Number(e.target.value) }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
                {formData.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Discount (₹)</label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      min="0"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: Number(e.target.value) }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => { setFormOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedCoupon ? 'Update' : 'Create'} Coupon
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="p-4 font-semibold">Code</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Value</th>
                <th className="p-4 font-semibold">Min Order</th>
                <th className="p-4 font-semibold">Usage</th>
                <th className="p-4 font-semibold">Expiry</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{coupon.code}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCouponCode(coupon.code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="p-4 capitalize">{coupon.type}</td>
                  <td className="p-4">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                    {coupon.maxDiscount && <div className="text-xs text-gray-500">Max: ₹{coupon.maxDiscount}</div>}
                  </td>
                  <td className="p-4">₹{coupon.minOrder}</td>
                  <td className="p-4">
                    <span className={`text-sm ${coupon.usedCount >= coupon.usageLimit ? 'text-red-600' : 'text-gray-700'}`}>
                      {coupon.usedCount}/{coupon.usageLimit}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm ${new Date(coupon.expiryDate) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(coupon)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {coupons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first coupon.</p>
          </div>
        )}
      </div>
    </div>
  )
}