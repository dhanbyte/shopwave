import { HOME_PRODUCTS } from './home';
import { TECH_PRODUCTS } from './tech';
import { AYURVEDIC_PRODUCTS } from './ayurvedic';
import { getApiProducts } from './apiProducts';
import type { Product } from '../types';

export async function getAllProducts(): Promise<Product[]> {
  const apiProducts = await getApiProducts();
  return [...HOME_PRODUCTS, ...TECH_PRODUCTS, ...AYURVEDIC_PRODUCTS, ...apiProducts];
}

export async function getHomeProducts(): Promise<Product[]> {
  if (HOME_PRODUCTS.length === 0) {
    // If no home products, show related tech products
    return TECH_PRODUCTS.slice(0, 8);
  }
  return HOME_PRODUCTS;
}

export async function getTechProducts(): Promise<Product[]> {
  if (TECH_PRODUCTS.length === 0) {
    // If no tech products, show related home products
    return HOME_PRODUCTS.slice(0, 8);
  }
  return TECH_PRODUCTS;
}

export async function getAyurvedicProducts(): Promise<Product[]> {
  if (AYURVEDIC_PRODUCTS.length === 0) {
    // If no ayurvedic products, show related products
    return [...HOME_PRODUCTS.slice(0, 4), ...TECH_PRODUCTS.slice(0, 4)];
  }
  return AYURVEDIC_PRODUCTS;
}