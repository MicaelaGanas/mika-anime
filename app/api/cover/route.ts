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

export const runtime = 'edge'; // Use edge runtime for better performance

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
    
    let response;
    let retries = 2;
    
    while (retries >= 0) {
      try {
        response = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mikareads/1.0 (Educational Project; https://github.com/yourusername/mika-anime)',
            // DO NOT send Referer header - MangaDex blocks hotlinking
            // DO NOT send Via header - MangaDex blocks proxies with Via header
          },
          // Use Next.js 15+ caching
          next: { 
            revalidate: 604800, // 7 days in seconds
          },
        });

        if (response.ok) break;
        
        // If rate limited by MangaDex, wait before retry
        if (response.status === 429) {
          const retryAfter = response.headers.get('X-RateLimit-Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 1000;
          await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 3000)));
          retries--;
          continue;
        }
        
        // For other errors, don't retry
        break;
      } catch (err) {
        retries--;
        if (retries < 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!response || !response.ok) {
      // Return placeholder instead of error to avoid breaking UI
      return NextResponse.json(
        { error: 'Cover not available' },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'public, max-age=60', // Cache errors for 1 minute only
          }
        }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the proxied image with aggressive caching and CORS headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        // Vercel Edge caching - 7 days with stale-while-revalidate for 1 day
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400, immutable',
        // Vercel-specific cache headers
        'CDN-Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
        // CORS headers - we inject our own as required by MangaDex
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        // Prevent downstream proxies from adding Via header
        'X-Proxy': 'MikaReads',
      },
    });
  } catch (error) {
    console.error('Cover API Route Error:', error);
    
    // Return error with short cache to avoid repeated failures
    return NextResponse.json(
      { error: 'Failed to fetch cover image' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'public, max-age=60', // Cache errors for 1 minute
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
