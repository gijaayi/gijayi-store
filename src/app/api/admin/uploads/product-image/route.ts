import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

function getCloudinaryConfig() {
  const explicitCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const explicitApiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const explicitApiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (explicitCloudName && explicitApiKey && explicitApiSecret) {
    return {
      cloudName: explicitCloudName,
      apiKey: explicitApiKey,
      apiSecret: explicitApiSecret,
    };
  }

  const raw = process.env.CLOUDINARY_URL;
  if (!raw) {
    throw new Error('Missing Cloudinary configuration. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.');
  }

  const parsed = new URL(raw);
  const cloudName = parsed.hostname;
  const apiKey = decodeURIComponent(parsed.username || '');
  const apiSecret = decodeURIComponent(parsed.password || '');

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Invalid CLOUDINARY_URL format.');
  }

  return { cloudName, apiKey, apiSecret };
}

function signCloudinaryParams(params: Record<string, string | number>, apiSecret: string) {
  const toSign = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex');
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 });
  }

  try {
    const form = await request.formData();
    const fileEntry = form.get('file');

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
    }

    if (!fileEntry.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 });
    }

    if (fileEntry.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Image must be 8MB or smaller.' }, { status: 400 });
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'gijayi/products';
    const signature = signCloudinaryParams({ folder, timestamp }, apiSecret);

    const cloudinaryForm = new FormData();
    cloudinaryForm.append('file', fileEntry);
    cloudinaryForm.append('api_key', apiKey);
    cloudinaryForm.append('timestamp', String(timestamp));
    cloudinaryForm.append('folder', folder);
    cloudinaryForm.append('signature', signature);

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryForm,
      cache: 'no-store',
    });

    const uploadJson = (await uploadResponse.json()) as {
      secure_url?: string;
      public_id?: string;
      error?: { message?: string };
    };

    if (!uploadResponse.ok || !uploadJson.secure_url) {
      const cloudinaryMessage = uploadJson.error?.message || 'Cloudinary upload failed.';
      const errorMessage = cloudinaryMessage.includes('Invalid Signature')
        ? 'Cloudinary credentials are invalid (signature mismatch). Update CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET with correct API credentials from Cloudinary Dashboard.'
        : cloudinaryMessage;

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: uploadJson.secure_url, publicId: uploadJson.public_id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to upload image.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
