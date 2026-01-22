import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter - 5 requests per second per MangaDex requirements
const requestLog = new Map<string, number[]>();
const MAX_REQUESTS_PER_SECOND = 4; // Slightly under 5 to be safe

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = requestLog.get(ip) || [];
  
  // Remove requests older than 1 second
  const recentRequests = requests.filter(time => now - time < 1000);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_SECOND) {
    return false; // Rate limit exceeded
  }
  
  recentRequests.push(now);
  requestLog.set(ip, recentRequests);
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mangaId = searchParams.get('mangaId');
    const fileName = searchParams.get('fileName');

    if (!mangaId || !fileName) {
      return NextResponse.json(
        { error: 'Missing mangaId or fileName parameter' },
        { status: 400 }
      );
    }

    // Rate limiting check
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(ip)) {
      // Return a cached response or wait
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Fetch cover image from MangaDex CDN with proper headers
    const imageUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
    
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mikareads/1.0 (Educational Project)',
      },
    });

    if (!response.ok) {
      console.error(`MangaDex responded with ${response.status} for ${imageUrl}`);
      // Return a placeholder image or error
      return NextResponse.json(
        { error: `Failed to fetch cover: ${response.status}` },
        { 
          status: response.status,
          headers: {
            'Cache-Control': 'public, max-age=60',
          }
        }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the proxied image with aggressive caching
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable', // 7 days
        'CDN-Cache-Control': 'public, s-maxage=604800',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Cover API Route Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch cover image' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'public, max-age=60',
        }
      }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
