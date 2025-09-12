import { NextResponse, type NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import type { Product } from '@/lib/types';

// GET a single product by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const db = await getDatabase();
        const product = await db.collection('products').findOne({ _id: new ObjectId(id) });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true,
            data: product
        });
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return NextResponse.json({ 
            success: false,
            error: 'Failed to fetch product' 
        }, { status: 500 });
    }
}

// PUT (update) a product by ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const productData = await request.json();
        
        // Validate required fields
        if (!productData.name || !productData.price?.original || !productData.category) {
            return NextResponse.json(
                { error: 'Missing required fields: name, price.original, category' },
                { status: 400 }
            );
        }
        
        const { _id, created_at, createdAt, ...updateData } = productData;
        
        // Ensure proper data structure for update
        const finalUpdateData = {
            ...updateData,
            // Ensure arrays are properly initialized
            extraImages: updateData.extraImages || [],
            features: updateData.features || [],
            tags: updateData.tags || [],
            specifications: updateData.specifications || {},
            // Ensure nested objects are properly structured
            inventory: {
                inStock: updateData.quantity > 0,
                lowStockThreshold: updateData.inventory?.lowStockThreshold || 5
            },
            returnPolicy: {
                eligible: updateData.returnPolicy?.eligible || true,
                duration: updateData.returnPolicy?.duration || 7
            },
            updatedAt: new Date()
        };

        const db = await getDatabase();
        const result = await db.collection('products').updateOne(
            { _id: new ObjectId(id) },
            { $set: finalUpdateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const updatedProduct = await db.collection('products').findOne({ _id: new ObjectId(id) });

        return NextResponse.json({ 
            success: true,
            data: updatedProduct
        });

    } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        return NextResponse.json({ 
            success: false,
            error: 'Failed to update product' 
        }, { status: 500 });
    }
}

// DELETE a product by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const db = await getDatabase();
        const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Product not found or failed to delete' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true,
            message: 'Product deleted successfully' 
        });
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        return NextResponse.json({ 
            success: false,
            error: 'Failed to delete product' 
        }, { status: 500 });
    }
}