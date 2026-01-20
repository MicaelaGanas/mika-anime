import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory cache with TTL
const cache = new Map<string, { data: any; expires: number }>();

function getCached(key: string) {
  const item = cache.get(key);
  if (item && item.expires > Date.now()) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCached(key: string, data: any, ttlSeconds: number = 600) {
  cache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check cache first - chapter data rarely changes
    const cacheKey = `chapter:${id}`;
    const cached = getCached(cacheKey);
    
    if (cached) {
      console.log(`[Cache HIT] Chapter ${id}`);
      const headers = new Headers();
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      headers.set('X-Cache', 'HIT');
      return NextResponse.json(cached, { headers });
    }

    // Fetch chapter server info from MangaDex with timeout - CACHED
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for Vercel

    const response = await fetch(`https://api.mangadex.org/at-home/server/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mikareads/1.0 (https://mika-anime.vercel.app)',
      },
      signal: controller.signal,
      cache: 'no-store',
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
      
      if (response.status === 429) {
        console.warn(`[RATE LIMIT] MangaDex rate limit hit for chapter ${id}`);
      }
      
      return NextResponse.json(
        { error: `MangaDex API returned ${response.status}` },
        { 
          status: response.status,
          headers,
        }
      );
    }

    const data = await response.json();
    
    // Cache chapter data for 10 minutes (chapters don't change often)
    setCached(cacheKey, data, 600);

    // Create response with proper CORS headers
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('X-Cache', 'MISS');

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
