import { HOME_PRODUCTS } from './home';
import { TECH_PRODUCTS } from './tech';
import { AYURVEDIC_PRODUCTS } from './ayurvedic';
import { getApiProducts } from './apiProducts';
import type { Product } from '../types';

export async function getAllProducts(): Promise<Product[]> {
  const apiProducts = await getApiProducts();
  return [...HOME_PRODUCTS, ...TECH_PRODUCTS, ...AYURVEDIC_PRODUCTS, ...apiProducts];
}