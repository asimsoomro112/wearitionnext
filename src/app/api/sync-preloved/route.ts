import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { verifyAdmin } from '@/lib/adminAuth';
import { clientIp, rateLimit } from '@/lib/rateLimit';

/**
 * WEARITION — Preloved Marketplace Sync API (admin only).
 *
 * The old route was an open POST: anyone could write arbitrary products
 * into the Preloved marketplace's Firestore under WEARITION's seller ID
 * (fake listings, reputational/fraud risk) using the store's service
 * account credential. Now it requires a valid Firebase ID token for an
 * admin email. The caller is AdminProducts (new-product submit only);
 * the sync is fire-and-forget there, so a 401 just logs and the product
 * save itself is unaffected. Errors are generic — internals stay
 * server-side. Rate-limited 10/hour per IP.
 */
export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`sync-preloved:ip:${ip}`, 10, 60 * 60 * 1000);
    if (!limited.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(limited.retryAfterMs / 1000)) },
        },
      );
    }

    const adminUser = await verifyAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 401 },
      );
    }

    const product = await request.json();

    if (
      !product ||
      typeof product.title !== 'string' ||
      !product.title.trim() ||
      product.title.length > 300 ||
      typeof product.price !== 'number' ||
      !(product.price > 0)
    ) {
      return NextResponse.json(
        { success: false, error: 'Valid product title and price are required' },
        { status: 400 },
      );
    }

    const serviceAccountRaw = process.env.PRELOVED_FIREBASE_SERVICE_ACCOUNT;
    const sellerId = process.env.PRELOVED_SELLER_ID;

    if (!serviceAccountRaw || !sellerId) {
      return NextResponse.json({ success: false, error: 'Preloved Sync configuration missing' }, { status: 500 });
    }

    const serviceAccount = JSON.parse(serviceAccountRaw);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    // Initialize Preloved App if not already initialized
    let prelovedApp;
    if (admin.apps.find(app => app?.name === 'preloved-sync')) {
      prelovedApp = admin.app('preloved-sync');
    } else {
      prelovedApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      }, 'preloved-sync');
    }

    const db = prelovedApp.firestore();

    const prelovedProductData = {
      sellerId: sellerId,
      title: product.title,
      brand: product.brand || 'Unknown',
      description: product.description || '',
      originalPrice: product.price,
      sellingPrice: product.price,
      condition: 'NEW',
      category: 'DRESSES',
      images: product.images || [],
      status: 'PENDING',
      stock: product.stock || 1,
      size: 'Unstitched',
      originalPacking: true,
      invoiceAvailable: true,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncMetadata: {
          source: 'wearition_auto_sync',
          originalCreatedAt: new Date().toISOString()
      }
    };

    const docRef = await db.collection('products').add(prelovedProductData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Product synced to Preloved Marketplace as PENDING'
    });

  } catch (error) {
    console.error('Preloved Sync Error:', error);
    return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 });
  }
}
