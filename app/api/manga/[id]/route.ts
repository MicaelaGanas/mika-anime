import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    // Check if this is a feed request
    const isFeed = searchParams.get('feed') === 'true';
    
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
      },
      cache: 'no-store', // Never cache - always get fresh data
    });

    if (!response.ok) {
      throw new Error(`MangaDex API error: ${response.status}`);
    }

    const data = await response.json();

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
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
