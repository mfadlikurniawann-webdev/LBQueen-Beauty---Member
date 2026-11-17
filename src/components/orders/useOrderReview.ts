import { useState } from "react";
import { useToast } from "@/components/Toast";
import type { Order } from "./order-utils";

export function useOrderReview() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const start = (next: Order) => {
    setOrder(next);
    setOpen(true);
  };

  const submit = async () => {
    if (!order || submitting) return;
    setSubmitting(true);
    const { submitOrderReview } = await import("@/app/actions/reviews");
    const result = await submitOrderReview(order.id, rating, text);
    setSubmitting(false);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    toast("Terima kasih! Ulasan Anda berhasil dikirim.", "success");
    setOpen(false);
    setOrder(null);
    setText("");
    setRating(5);
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
