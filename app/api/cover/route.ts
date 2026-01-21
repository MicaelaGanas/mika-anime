import { NextRequest, NextResponse } from 'next/server';

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

    // Fetch cover image from MangaDex
    const imageUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mikareads/1.0 (https://mika-anime.vercel.app)',
        'Referer': 'https://mangadex.org',
      },
      cache: 'force-cache', // Cache images for better performance
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cover: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Cover API Route Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cover image' },
      { status: 500 }
    );
  }
}
