import { submitOrderReview } from "@/app/actions/reviews";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import type { Order } from "./order-utils";

/** onSubmitted: tandai pesanan sudah diulas agar tombol "Beri Ulasan" hilang. */
export function useOrderReview(onSubmitted?: (orderId: number) => void) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const start = (next: Order) => {
    setOrder(next);
    setRating(0);
    setText("");
    setOpen(true);
  };

  const submit = async () => {
    if (!order || submitting || rating < 1) return;
    setSubmitting(true);
    const result = await submitOrderReview(order.id, rating, text);
    setSubmitting(false);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    toast("Terima kasih, ulasan terkirim.", "success");
    onSubmitted?.(order.id);
    setOpen(false);
    setOrder(null);
    setText("");
    setRating(0);
  };

  return {
    open,
    close: () => setOpen(false),
    order,
    text,
    setText,
    rating,
    setRating,
    submitting,
    start,
    submit,
  };
}

export type OrderReview = ReturnType<typeof useOrderReview>;
