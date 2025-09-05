import type { Product } from './types'

// Google Apps Script API Configuration
const APPS_SCRIPT_API_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_API_URL

export class GoogleAppsScriptService {
  private static instance: GoogleAppsScriptService
  private apiUrl: string

  private constructor() {
    this.apiUrl = APPS_SCRIPT_API_URL || ''
  }

  public static getInstance(): GoogleAppsScriptService {
    if (!GoogleAppsScriptService.instance) {
      GoogleAppsScriptService.instance = new GoogleAppsScriptService()
    }
    return GoogleAppsScriptService.instance
  }

  // Fetch all products from Google Apps Script API
  async getProducts(): Promise<Product[]> {
    // Check if API URL is configured
    if (!this.apiUrl || this.apiUrl.trim() === '') {
      console.log('Google Apps Script API URL not configured, skipping external fetch')
      throw new Error('Google Apps Script API URL not configured')
    }

    try {
      console.log('Fetching products from:', `${this.apiUrl}?method=GET&action=list`)
      
      const response = await fetch(`${this.apiUrl}?method=GET&action=list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response received:', text.substring(0, 200))
        throw new Error('Google Apps Script returned non-JSON response (likely an error page)')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch products')
      }

      return data.data || []
    } catch (error) {
      console.error('Error fetching products from Apps Script:', error)
      return []
    }
  }

  // Get a single product by ID
  async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${this.apiUrl}?method=GET&action=get&id=${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Product not found')
      }

      return data.data || null
    } catch (error) {
      console.error('Error fetching product from Apps Script:', error)
      return null
    }
  }

  // Add a new product via Google Apps Script API
  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'POST',
          ...product
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to add product')
      }

      return data.data
    } catch (error) {
      console.error('Error adding product via Apps Script:', error)
      throw error
    }
  }

  // Update a product via Google Apps Script API
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'PUT',
          id: id,
          ...updates
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update product')
      }

      return data.data || null
    } catch (error) {
      console.error('Error updating product via Apps Script:', error)
      throw error
    }
  }

  // Delete a product via Google Apps Script API
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}?method=DELETE&id=${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete product')
      }

      return true
    } catch (error) {
      console.error('Error deleting product via Apps Script:', error)
      return false
    }
  }

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await fetch(`${this.apiUrl}?method=GET&action=search&query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Search failed')
      }

      return data.data || []
    } catch (error) {
      console.error('Error searching products via Apps Script:', error)
      return []
    }
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await fetch(`${this.apiUrl}?method=GET&action=category&category=${encodeURIComponent(category)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch products by category')
      }

      return data.data || []
    } catch (error) {
      console.error('Error fetching products by category via Apps Script:', error)
      return []
    }
  }
}

// Export singleton instance
export const googleAppsScriptService = GoogleAppsScriptService.getInstance()
