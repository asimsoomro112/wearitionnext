import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { clientIp, rateLimit } from '@/lib/rateLimit';
import {
  detectImageMime,
  isAllowedImageMime,
  MAX_UPLOAD_BYTES,
} from '@/lib/fileValidation';

/**
 * WEARITION — Image Upload API (validated, purpose-split).
 *
 * The old route accepted ANY file from ANYONE (no auth, no type/size
 * check, resource_type 'auto') — anyone could store arbitrary files
 * (including executables) in the store's Cloudinary account.
 *
 * Now: image files only (MIME allowlist + magic-byte sniffing — the MIME
 * header is client-controlled), max 10MB (matches the checkout client
 * check), resource_type 'image', rate-limited (20/hour per IP).
 * Two purposes:
 *  - payment_proof (default): open — guests need it for the checkout
 *    payment screenshot. Lands in wearition_payment_proofs.
 *  - product: admin only (Firebase ID token, admin email). Lands in
 *    wearition_products.
 * Errors are generic — Cloudinary internals are logged server-side only.
 */
export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`upload:ip:${ip}`, 20, 60 * 60 * 1000);
    if (!limited.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many uploads. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(limited.retryAfterMs / 1000)) },
        },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const purposeRaw = formData.get('purpose');
    const purpose = purposeRaw === 'product' ? 'product' : 'payment_proof';

    // Product images are admin-only; payment screenshots are open (guests).
    if (purpose === 'product') {
      const admin = await verifyAdmin(request);
      if (!admin) {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 401 },
        );
      }
    }

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: 'That image is too large (max 10MB).' },
        { status: 400 },
      );
    }
    if (!isAllowedImageMime(file.type || '')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed.' },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const detected = detectImageMime(new Uint8Array(buffer));
    if (!detected || detected !== file.type.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'File content does not match an image.' },
        { status: 400 },
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: 'Upload service unavailable' },
        { status: 503 },
      );
    }

    // Set config inside the handler to ensure env variables are fresh
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const folder =
      purpose === 'product' ? 'wearition_products' : 'wearition_payment_proofs';

    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Stream Error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Upload Route Catch Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error during upload',
      },
      { status: 500 },
    );
  }
}
