import CategoryClient from "./category-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ type: "promo" }, { type: "layanan" }, { type: "produk" }];
}

export default function CategoryPage() {
  return <CategoryClient />;
}
