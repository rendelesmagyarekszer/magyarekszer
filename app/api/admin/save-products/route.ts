export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { saveProducts, getProducts } from '@/lib/products-server';

export async function GET() {
    try {
        const products = getProducts();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { products } = await req.json();
        if (!Array.isArray(products)) {
            return NextResponse.json({ error: 'Invalid products data' }, { status: 400 });
        }
        saveProducts(products);
        return NextResponse.json({ success: true, count: products.length });
    } catch (error) {
        console.error('API save-products error:', error);
        return NextResponse.json({ error: 'Failed to save products' }, { status: 500 });
    }
}
