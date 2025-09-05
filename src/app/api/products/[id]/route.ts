import { NextResponse, type NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import type { Product } from '@/lib/types';

// GET a single product by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
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
        console.error(`Error fetching product ${params.id}:`, error);
        return NextResponse.json({ 
            success: false,
            error: 'Failed to fetch product' 
        }, { status: 500 });
    }
}

// PUT (update) a product by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const productData = await request.json();
        const { _id, created_at, ...updateData } = productData;

        const db = await getDatabase();
        const result = await db.collection('products').updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    ...updateData, 
                    updated_at: new Date() 
                } 
            }
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
        console.error(`Error updating product ${params.id}:`, error);
        return NextResponse.json({ 
            success: false,
            error: 'Failed to update product' 
        }, { status: 500 });
    }
}

// DELETE a product by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
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
        console.error(`Error deleting product ${params.id}:`, error);
        return NextResponse.json({ 
            success: false,
            error: 'Failed to delete product' 
        }, { status: 500 });
    }
}