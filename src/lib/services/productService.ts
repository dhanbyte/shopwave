import { HOME_PRODUCTS } from '../data/home';
import { TECH_PRODUCTS } from '../data/tech';
import type { Product } from '../types';

export class ProductService {
  private static API_BASE_URL = 'https://jsonplaceholder.typicode.com/posts';

  static async getAllProducts(): Promise<Product[]> {
    try {
      const localProducts = [...HOME_PRODUCTS, ...TECH_PRODUCTS];
      
      const apiResponse = await fetch(this.API_BASE_URL);
      const apiData = await apiResponse.json();
      
      const apiProducts: Product[] = apiData.slice(0, 3).map((item: any, index: number) => ({
        id: `API_${item.id}`,
        slug: `api-product-${item.id}`,
        name: item.title,
        brand: 'API Brand',
        category: 'API',
        subcategory: 'External',
        price: { original: 99 + index * 10, discounted: 49 + index * 5, currency: '₹' },
        quantity: 50,
        image: 'https://via.placeholder.com/300x300?text=API+Product',
        description: item.body,
        shortDescription: item.title.substring(0, 50) + '...',
        features: ['API Feature 1', 'API Feature 2'],
        ratings: { average: 4.0 + (index * 0.2), count: 10 + index * 5 },
        taxPercent: 18,
        sku: `API_${item.id}`,
        specifications: { 'Source': 'API', 'Type': 'External' }
      }));

      return [...localProducts, ...apiProducts];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [...HOME_PRODUCTS, ...TECH_PRODUCTS];
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    const allProducts = await this.getAllProducts();
    return allProducts.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  static async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    const allProducts = await this.getAllProducts();
    return allProducts
      .sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0))
      .slice(0, limit);
  }
}