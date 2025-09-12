import { google } from 'googleapis'
import type { Product } from './types'

// Google Sheets Configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || 'https://script.google.com/macros/s/AKfycbxH8e_F_8wwALwuVpqW6cELLXDcNx_2ZEs8hLX6PHMpgaTm-qn9Dex7pxKPFaxzMWB7/exec?method=GET&action=list'
const API_KEY = process.env.GOOGLE_API_KEY || 'your-api-key'
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'your-service-account@project.iam.gserviceaccount.com'
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || 'your-private-key'

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: SERVICE_ACCOUNT_EMAIL,
    private_key: PRIVATE_KEY,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

export class GoogleSheetsService {
  private static instance: GoogleSheetsService
  private spreadsheetId: string

  private constructor() {
    this.spreadsheetId = SPREADSHEET_ID
  }

  public static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService()
    }
    return GoogleSheetsService.instance
  }

  // Fetch all products from Google Sheets
  async getProducts(): Promise<Product[]> {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Products!A2:Z', // Assuming products are in 'Products' sheet starting from row 2
      })

      const rows = response.data.values || []
      
      return rows.map((row, index) => ({
        id: row[0] || `product-${index + 1}`,
        name: row[1] || '',
        slug: row[2] || '',
        brand: row[7] || '',
        category: row[5] || '',
        subcategory: row[6] || '',
        image: row[11] ? row[11].split(',')[0]?.trim() : '',
        extraImages: row[11] ? row[11].split(',').slice(1).map((img: string) => img.trim()) : [],
        quantity: parseInt(row[13]) || 0,
        price: {
          original: parseFloat(row[3]) || 0,
          discounted: parseFloat(row[4]) || undefined,
          currency: 'INR'
        },
        description: row[8] || '',
        shortDescription: row[8]?.substring(0, 100) || '',
        features: row[9] ? row[9].split(',').map((f: string) => f.trim()) : [],
        specifications: row[10] ? JSON.parse(row[10]) : {},
        tags: row[16] ? row[16].split(',').map((tag: string) => tag.trim()) : [],
        inventory: {
          inStock: row[12]?.toLowerCase() === 'true',
          lowStockThreshold: 5
        },
        ratings: {
          average: parseFloat(row[14]) || 0,
          count: parseInt(row[15]) || 0
        },
        status: (row[17]?.toLowerCase() !== 'false' ? 'active' : 'inactive') as 'active' | 'inactive',
        codAvailable: true,
        warranty: row[18] || ''
      }))
    } catch (error) {
      console.error('Error fetching products from Google Sheets:', error)
      return []
    }
  }

  // Get a single product by ID
  async getProduct(id: string): Promise<Product | null> {
    const products = await this.getProducts()
    return products.find(product => product.id === id) || null
  }

  // Add a new product to Google Sheets
  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const newProduct: Product = {
        ...product,
        id: `product-${Date.now()}`,
      }

      const values = [
        [
          newProduct.id,
          newProduct.name,
          newProduct.slug,
          newProduct.price.original,
          newProduct.price.discounted || '',
          newProduct.category,
          newProduct.subcategory || '',
          newProduct.brand || '',
          newProduct.description || '',
          newProduct.features?.join(', ') || '',
          JSON.stringify(newProduct.specifications || {}),
          [newProduct.image, ...(newProduct.extraImages || [])].join(', '),
          newProduct.inventory?.inStock || false,
          newProduct.quantity || 0,
          newProduct.ratings?.average || 0,
          newProduct.ratings?.count || 0,
          newProduct.tags?.join(', ') || '',
          newProduct.status === 'active',
          newProduct.warranty || '',
        ]
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Products!A:Z',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      })

      return newProduct
    } catch (error) {
      console.error('Error adding product to Google Sheets:', error)
      throw error
    }
  }

  // Update a product in Google Sheets
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const products = await this.getProducts()
      const productIndex = products.findIndex(p => p.id === id)
      
      if (productIndex === -1) {
        return null
      }

      const updatedProduct = {
        ...products[productIndex],
        ...updates,
      }

      const rowIndex = productIndex + 2 // +2 because sheets start from 1 and we skip header
      const values = [
        [
          updatedProduct.id,
          updatedProduct.name,
          updatedProduct.slug,
          updatedProduct.price.original,
          updatedProduct.price.discounted || '',
          updatedProduct.category,
          updatedProduct.subcategory || '',
          updatedProduct.brand || '',
          updatedProduct.description || '',
          updatedProduct.features?.join(', ') || '',
          JSON.stringify(updatedProduct.specifications || {}),
          [updatedProduct.image, ...(updatedProduct.extraImages || [])].join(', '),
          updatedProduct.inventory?.inStock || false,
          updatedProduct.quantity || 0,
          updatedProduct.ratings?.average || 0,
          updatedProduct.ratings?.count || 0,
          updatedProduct.tags?.join(', ') || '',
          updatedProduct.status === 'active',
          updatedProduct.warranty || '',
        ]
      ]

      await sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Products!A${rowIndex}:Z${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      })

      return updatedProduct
    } catch (error) {
      console.error('Error updating product in Google Sheets:', error)
      throw error
    }
  }

  // Delete a product from Google Sheets
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const products = await this.getProducts()
      const productIndex = products.findIndex(p => p.id === id)
      
      if (productIndex === -1) {
        return false
      }

      const rowIndex = productIndex + 2 // +2 because sheets start from 1 and we skip header

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0, // Assuming first sheet
                  dimension: 'ROWS',
                  startIndex: rowIndex - 1,
                  endIndex: rowIndex,
                },
              },
            },
          ],
        },
      })

      return true
    } catch (error) {
      console.error('Error deleting product from Google Sheets:', error)
      return false
    }
  }
}

export const googleSheetsService = GoogleSheetsService.getInstance()
