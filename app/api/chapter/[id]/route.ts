import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch chapter server info from MangaDex with timeout - NO CACHING
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for Vercel

    const response = await fetch(`https://api.mangadex.org/at-home/server/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mikareads/1.0',
      },
      signal: controller.signal,
      cache: 'no-store', // Force fresh fetch every time
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MangaDex API error ${response.status}:`, errorText);
      
      // Return errors with CORS headers
      const headers = new Headers();
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return NextResponse.json(
        { error: `MangaDex API returned ${response.status}` },
        { 
          status: response.status,
          headers,
        }
      );
    }

    const data = await response.json();

    // Create response with proper CORS headers
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return NextResponse.json(data, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Chapter Server API Error:', error);
    
    // Return errors with CORS headers too
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return NextResponse.json(
      { error: error?.name === 'AbortError' ? 'Request timeout' : 'Failed to fetch chapter server', details: error?.message },
      { 
        status: error?.name === 'AbortError' ? 504 : 500,
        headers,
      }
    );
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return new NextResponse(null, {
    status: 200,
    headers,
  });
}
