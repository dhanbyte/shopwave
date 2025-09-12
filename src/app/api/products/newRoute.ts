import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheets';
import type { Product } from '@/lib/types';

// GET all products
export async function GET() {
    try {
        const products = await googleSheetsService.getProducts();
        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// POST - create a new product
export async function POST(request: Request) {
    try {
        const productData = await request.json();
        
        // Validate required fields
        if (!productData.name || !productData.price || !productData.category) {
            return NextResponse.json(
                { error: 'Missing required fields: name, price, category' },
                { status: 400 }
            );
        }

        const newProduct = await googleSheetsService.addProduct(productData);
        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
