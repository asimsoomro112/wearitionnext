import { ClientShell, StoreLayout } from "@/components/ClientShell";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore/lite";
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
  
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const product = docSnap.data();
      return {
        title: `${product.title} | WEARITION`,
        description: product.description || `Shop ${product.title} at WEARITION.`,
        openGraph: {
          title: `${product.title} | WEARITION`,
          description: product.description || `Shop ${product.title} at WEARITION.`,
          images: product.images && product.images.length > 0 ? [product.images[0]] : [],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  // Neutral fallback: this branch also runs when the server-side fetch is
  // merely slow/unreachable, and the client corrects the title once the
  // product loads — it must never flash "Product Not Found" for a product
  // that exists.
  return {
    title: 'Shop | WEARITION',
  };
}

export default async function ProductPage(props: Props) {
  const params = await props.params;
  return <ClientShell><StoreLayout><ProductClient /></StoreLayout></ClientShell>;
}
