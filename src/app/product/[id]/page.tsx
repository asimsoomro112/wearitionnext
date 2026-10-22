import { ClientShell, StoreLayout } from "@/components/ClientShell";
import { adminDb } from "@/lib/firebase-admin";
import type { Metadata, ResolvingMetadata } from "next";
import { ProductClient } from "./ProductClient";

type Props = {
  params: Promise<{ id: string }>
};

type ProductDoc = {
  title: string;
  description?: string;
  images?: string[];
  brand?: string;
  price?: number;
  stock?: number;
};

async function getProduct(id: string): Promise<ProductDoc | null> {
  try {
    if (!adminDb) return null;
    const docSnap = await adminDb.collection("products").doc(id).get();
    if (!docSnap.exists) return null;
    return docSnap.data() as ProductDoc;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;
  
  // Server-side metadata goes through the Admin SDK: the public web API
  // key's restrictions reject non-browser Firestore calls, so the previous
  // client-SDK fetch failed on the server and real product titles rarely
  // reached search engines / link previews.
  const product = await getProduct(id);
  if (product) {
    return {
      title: product.title,
      alternates: {
        canonical: `https://www.wearition.store/product/${id}`,
      },
      description: product.description || `Shop ${product.title} at WEARITION.`,
      openGraph: {
        title: `${product.title} | WEARITION`,
        description: product.description || `Shop ${product.title} at WEARITION.`,
        images: product.images && product.images.length > 0 ? [product.images[0]] : [],
      },
    };
  }

  // Neutral fallback: this branch also runs when the server-side fetch is
  // merely slow/unreachable, and the client corrects the title once the
  // product loads — it must never flash "Product Not Found" for a product
  // that exists.
  return {
    title: 'Shop',
  };
}

export default async function ProductPage(props: Props) {
  const params = await props.params;

  // Product structured data (QA SEV-3, 2026-10-22): makes the product
  // eligible for rich search results (price / availability). Built only
  // from fields the product document actually has; if the server fetch
  // fails, the page simply ships without it — never an error.
  const product = await getProduct(params.id);
  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    ...(product.description ? { description: product.description } : {}),
    ...(product.images && product.images.length > 0 ? { image: product.images } : {}),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(typeof product.price === 'number' ? {
      offers: {
        '@type': 'Offer',
        url: `https://www.wearition.store/product/${params.id}`,
        priceCurrency: 'PKR',
        price: product.price,
        availability: typeof product.stock === 'number'
          ? (product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock')
          : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    } : {}),
  } : null;

  return (
    <ClientShell>
      <StoreLayout>
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        <ProductClient />
      </StoreLayout>
    </ClientShell>
  );
}
