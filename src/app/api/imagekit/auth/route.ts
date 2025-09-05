
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json(
      { error: 'ImageKit is not configured for this project.' },
      { status: 501 }
    );
}
