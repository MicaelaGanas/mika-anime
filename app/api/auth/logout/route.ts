import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Clear auth cookies
  response.cookies.delete('mangadex_token');
  response.cookies.delete('mangadex_refresh');
  
  return response;
}
