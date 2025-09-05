import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import type { Product } from '@/lib/types';

// GET all products with filtering support
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        const db = await getDatabase();
        let query: any = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await db.collection('products').find(query).toArray();

        return NextResponse.json({ 
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        console.error('Error fetching products from MongoDB:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to fetch products' 
            },
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

        const db = await getDatabase();
        const newProduct = {
            ...productData,
            created_at: new Date(),
            updated_at: new Date()
        };
        
        const result = await db.collection('products').insertOne(newProduct);
        
        return NextResponse.json({ 
            success: true,
            data: { ...newProduct, _id: result.insertedId }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating product in MongoDB:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to create product' 
            },
            { status: 500 }
        );
    }
}