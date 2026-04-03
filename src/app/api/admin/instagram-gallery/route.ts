import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { readDatabase, updateDatabase } from '@/lib/server/database';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    console.log('[Instagram Gallery API] GET request started');
    const db = await readDatabase();
    console.log('[Instagram Gallery API] Database read successful, gallery data:', !!db.instagramGallery);
    
    const instagramGallery = db.instagramGallery || {
      id: 'instagram-gallery-config',
      handle: 'begijayi',
      profileUrl: 'https://instagram.com/begijayi',
      maxImages: 6,
      images: [],
      updatedAt: new Date().toISOString(),
    };
    
    console.log('[Instagram Gallery API] Returning gallery with', instagramGallery.images?.length || 0, 'images');
    return NextResponse.json({ instagramGallery });
  } catch (error) {
    console.error('[Instagram Gallery API] Error fetching Instagram gallery:', error instanceof Error ? error.message : String(error));
    // Return fallback data even on error
    return NextResponse.json({ 
      instagramGallery: {
        id: 'instagram-gallery-config',
        handle: 'begijayi',
        profileUrl: 'https://instagram.com/begijayi',
        maxImages: 6,
        images: [],
        updatedAt: new Date().toISOString(),
      },
      warning: 'Using fallback data due to database error'
    });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    console.warn('[Instagram Gallery API] Unauthorized PUT request:', auth.error);
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    console.log('[Instagram Gallery API] PUT request started by admin:', auth.user.id);
    const body = (await request.json()) as {
      handle?: string;
      profileUrl?: string;
      maxImages?: number;
      images?: Array<{ id?: string; url: string }>;
    };

    console.log('[Instagram Gallery API] Received', body.images?.length || 0, 'images to update');

    await updateDatabase((db) => {
      const current = db.instagramGallery || {
        id: 'instagram-gallery-config',
        handle: 'begijayi',
        profileUrl: 'https://instagram.com/begijayi',
        maxImages: 6,
        images: [],
        updatedAt: new Date().toISOString(),
      };

      // Initialize images if not present
      let images = current.images || [];

      // Update handle if provided
      if (body.handle !== undefined) {
        const newHandle = body.handle.trim() || 'begijayi';
        console.log('[Instagram Gallery API] Updating handle from', current.handle, 'to', newHandle);
        current.handle = newHandle;
        current.profileUrl = `https://instagram.com/${current.handle}`;
      }

      // Update maxImages if provided
      if (body.maxImages !== undefined) {
        const newMax = Math.max(1, Math.min(12, body.maxImages));
        console.log('[Instagram Gallery API] Updating maxImages to', newMax);
        current.maxImages = newMax;
      }

      // Update images if provided
      if (Array.isArray(body.images)) {
        images = body.images.map((img) => ({
          id: img.id || randomUUID(),
          url: img.url.trim(),
          uploadedAt: new Date().toISOString(),
        }));
        // Limit images to maxImages
        images = images.slice(0, current.maxImages);
        console.log('[Instagram Gallery API] Updated images, keeping', images.length, 'out of', body.images.length, 'provided');
      }

      db.instagramGallery = {
        ...current,
        images,
        updatedAt: new Date().toISOString(),
      };
      
      console.log('[Instagram Gallery API] Instagram gallery updated successfully');
    });

    const updated = await readDatabase();
    console.log('[Instagram Gallery API] Database read after update, returning', updated.instagramGallery?.images?.length || 0, 'images');
    return NextResponse.json({ instagramGallery: updated.instagramGallery });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Instagram Gallery API] Error updating Instagram gallery:', errorMsg);
    console.error('[Instagram Gallery API] Full error:', error);
    return NextResponse.json({ error: 'Failed to update Instagram gallery: ' + errorMsg }, { status: 500 });
  }
}
