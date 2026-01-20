import { NextRequest, NextResponse } from 'next/server';

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

function setCached(key: string, data: any, ttlSeconds: number = 300) {
  cache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    // Check if this is a feed request
    const isFeed = searchParams.get('feed') === 'true';
    
    // Create cache key from all params
    const cacheKey = `manga:${id}:${isFeed}:${new URLSearchParams(searchParams).toString()}`;
    
    // Check cache first (especially for feed requests)
    if (isFeed) {
      const cached = getCached(cacheKey);
      if (cached) {
        console.log(`[Cache HIT] ${cacheKey}`);
        const headers = new Headers();
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        headers.set('X-Cache', 'HIT');
        return NextResponse.json(cached, { headers });
      }
    }
    
    let apiUrl: string;
    if (isFeed) {
      // Fetch manga feed (chapters)
      apiUrl = `https://api.mangadex.org/manga/${id}/feed`;
    } else {
      // Fetch manga details
      apiUrl = `https://api.mangadex.org/manga/${id}`;
    }
    
    // Add all query parameters
    const url = new URL(apiUrl);
    searchParams.forEach((value, key) => {
      if (key !== 'feed') {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mikareads/1.0 (https://mika-anime.vercel.app)',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`[RATE LIMIT] MangaDex rate limit hit for ${url}`);
      }
      throw new Error(`MangaDex API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache feed responses (they change less frequently)
    if (isFeed && data.data) {
      setCached(cacheKey, data, 600); // Cache for 10 minutes
    }

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('X-Cache', 'MISS');
    
    return NextResponse.json(data, {
      headers,
    });
  } catch (error) {
    console.error('Manga Detail API Error:', error);
    
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return NextResponse.json(
      { error: 'Failed to fetch manga details' },
      { 
        status: 500,
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
