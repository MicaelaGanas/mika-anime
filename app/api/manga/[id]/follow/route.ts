import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.cookies.get('mangadex_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const response = await fetch(`https://api.mangadex.org/manga/${id}/follow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Follow manga failed:', errorText);
      throw new Error('Failed to follow manga');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Follow manga error:', error);
    return NextResponse.json({ error: 'Failed to follow manga' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.cookies.get('mangadex_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const response = await fetch(`https://api.mangadex.org/manga/${id}/follow`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to unfollow manga');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unfollow manga error:', error);
    return NextResponse.json({ error: 'Failed to unfollow manga' }, { status: 500 });
  }
}
