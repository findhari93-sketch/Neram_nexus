import { NextRequest, NextResponse } from 'next/server';

/**
 * Image Proxy API Route
 *
 * Purpose: Bypass CORS restrictions for external image URLs (Google, Facebook, etc.)
 *
 * Security Features:
 * - Domain allowlist (only trusted sources)
 * - URL validation
 * - Content-Type validation
 * - 10-second timeout
 *
 * Caching:
 * - 1 day cache (86400s)
 * - 1 week stale-while-revalidate (604800s)
 */
export async function GET(request: NextRequest) {
  try {
    const imageUrl = request.nextUrl.searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    // Validate URL format
    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch {
      return new NextResponse('Invalid URL format', { status: 400 });
    }

    // Security: Validate URL is from allowed domains
    const allowedDomains = [
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      'graph.facebook.com',
      'avatars.githubusercontent.com',
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
    ];

    if (!allowedDomains.includes(url.hostname)) {
      console.warn('❌ Proxy blocked - domain not allowed:', url.hostname);
      return new NextResponse('Domain not allowed', { status: 403 });
    }

    console.log('🔄 Proxying image from:', url.hostname);

    // Fetch the image with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    let response: Response;
    try {
      response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NextJS/14.0)',
          'Accept': 'image/*',
        },
        signal: controller.signal,
      });
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('⏱️ Image fetch timeout:', imageUrl);
        return new NextResponse('Request timeout', { status: 504 });
      }
      console.error('❌ Image fetch error:', error.message);
      return new NextResponse('Failed to fetch image', { status: 502 });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      console.error('❌ Image fetch failed with status:', response.status);
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    // Validate Content-Type is an image
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      console.warn('⚠️ Non-image content type:', contentType);
      return new NextResponse('Invalid content type', { status: 415 });
    }

    // Get image buffer
    const buffer = await response.arrayBuffer();

    console.log('✅ Image proxied successfully:', buffer.byteLength, 'bytes');

    // Return image with proper caching headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'X-Proxy-Cache': 'HIT',
      },
    });
  } catch (error) {
    console.error('💥 Proxy internal error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
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
