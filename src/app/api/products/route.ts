import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { AYURVEDIC_PRODUCTS } from '@/lib/data/ayurvedic';
import { TECH_PRODUCTS } from '@/lib/data/tech';
import { HOME_PRODUCTS } from '@/lib/data/home';
import type { Product } from '@/lib/types';

// GET all products with filtering support
export async function GET(request: Request, context?: { params?: Promise<any> }) {
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

        const mongoProducts = await db.collection('products').find(query).toArray();
        
        // Filter JSON products based on query
        let jsonProducts = [...TECH_PRODUCTS, ...HOME_PRODUCTS, ...AYURVEDIC_PRODUCTS];
        if (category) {
            jsonProducts = jsonProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }
        if (search) {
            jsonProducts = jsonProducts.filter(p => 
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Combine both sources
        const allProducts = [...mongoProducts, ...jsonProducts];

        return NextResponse.json({ 
            success: true,
            data: allProducts,
            count: allProducts.length,
            sources: {
                mongodb: mongoProducts.length,
                json: jsonProducts.length
            }
        });
    } catch (error) {
        console.error('Error fetching products from MongoDB:', error);
        
        // Fallback to JSON products only
        let jsonProducts = [...TECH_PRODUCTS, ...HOME_PRODUCTS, ...AYURVEDIC_PRODUCTS];
        if (category) {
            jsonProducts = jsonProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }
        if (search) {
            jsonProducts = jsonProducts.filter(p => 
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        return NextResponse.json({ 
            success: true,
            data: jsonProducts,
            count: jsonProducts.length,
            sources: {
                mongodb: 0,
                json: jsonProducts.length
            },
            warning: 'MongoDB connection failed, showing JSON products only'
        });
    }
}

// POST - create a new product
export async function POST(request: Request, context?: { params?: Promise<any> }) {
    try {
        const productData = await request.json();
        
        // Validate required fields
        if (!productData.name || !productData.price?.original || !productData.category || !productData.image) {
            return NextResponse.json(
                { error: 'Missing required fields: name, price.original, category, image' },
                { status: 400 }
            );
        }

        // Generate ID and ensure proper data structure
        const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const db = await getDatabase();
        const newProduct = {
            id: productId,
            ...productData,
            // Ensure arrays are properly initialized
            extraImages: productData.extraImages || [],
            features: productData.features || [],
            tags: productData.tags || [],
            specifications: productData.specifications || {},
            // Ensure nested objects are properly structured
            inventory: {
                inStock: productData.quantity > 0,
                lowStockThreshold: productData.inventory?.lowStockThreshold || 5
            },
            returnPolicy: {
                eligible: productData.returnPolicy?.eligible || true,
                duration: productData.returnPolicy?.duration || 7
            },
            // Add timestamps
            createdAt: new Date(),
            updatedAt: new Date()
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