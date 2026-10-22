import { ClientShell, StoreLayout } from "@/components/ClientShell";
import { adminDb } from "@/lib/firebase-admin";
import type { Metadata, ResolvingMetadata } from "next";
import { ProductClient } from "./ProductClient";

type Props = {
  params: Promise<{ id: string }>
};

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
  try {
    if (adminDb) {
      const docSnap = await adminDb.collection("products").doc(id).get();

      if (docSnap.exists) {
        const product = docSnap.data() as { title: string; description?: string; images?: string[] };
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
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
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
  return <ClientShell><StoreLayout><ProductClient /></StoreLayout></ClientShell>;
}
