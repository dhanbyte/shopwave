import type { Product } from '../types';

export async function getApiProducts(): Promise<Product[]> {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();
    
    return data.slice(0, 3).map((item: any, index: number) => ({
      id: `API_${item.id}`,
      slug: `api-product-${item.id}`,
      name: item.title,
      brand: 'API Brand',
      category: 'API',
      price: { original: 99 + index * 10, discounted: 49 + index * 5, currency: '₹' },
      quantity: 50,
      image: 'https://via.placeholder.com/300x300?text=API+Product',
      description: item.body,
      ratings: { average: 4.0 + (index * 0.2), count: 10 + index * 5 },
      taxPercent: 18,
      sku: `API_${item.id}`
    }));
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}