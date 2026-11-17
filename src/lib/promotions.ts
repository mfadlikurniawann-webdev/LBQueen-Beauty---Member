export type Promotion = { product_id: number | null; type: string; discount_amount: number; min_transaction: number };

export function productDiscount(price: number, promotions: Promotion[]) {
  return Math.min(price, Math.max(0, ...promotions.filter(promo => Number(promo.min_transaction) === 0).map(promo => promo.type === "percent" ? Math.round(price * Number(promo.discount_amount) / 100) : promo.type === "free_service" ? price : Number(promo.discount_amount))));
}
