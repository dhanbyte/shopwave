import { NextResponse, type NextRequest } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheets';
import type { Product } from '@/lib/types';

// GET a single product by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const product = await googleSheetsService.getProduct(params.id);
        
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

// PUT (update) a product by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const updates = await request.json();
        
        const updatedProduct = await googleSheetsService.updateProduct(params.id, updates);
        
        if (!updatedProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

// DELETE a product by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const success = await googleSheetsService.deleteProduct(params.id);
        
        if (!success) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
