import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const product = await request.json();
    
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

  } catch (error: any) {
    console.error('Preloved Sync Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
