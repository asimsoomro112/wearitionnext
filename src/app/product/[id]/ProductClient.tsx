"use client";
import dynamic from "next/dynamic";

const ProductDetails = dynamic(
  () => import("@/views/ProductDetails").then((m) => ({ default: m.ProductDetails })),
  { ssr: false }
);

export function ProductClient() {
  return <ProductDetails />;
}
