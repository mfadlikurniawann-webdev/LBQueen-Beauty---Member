"use client";

import { Button } from "@/components/ui/button";

export function PageControls({ page, hasMore, loading, onChange }: {
  page: number; hasMore: boolean; loading: boolean; onChange: (page: number) => void;
}) {
  return <nav aria-label="Navigasi halaman data" className="flex flex-wrap items-center justify-center gap-3 py-4">
    <Button variant="outline" disabled={loading || page <= 1} onClick={() => onChange(page - 1)}>Sebelumnya</Button>
    <span aria-live="polite" className="text-sm text-muted-foreground">Halaman {page}</span>
    <Button variant="outline" disabled={loading || !hasMore} onClick={() => onChange(page + 1)}>Berikutnya</Button>
  </nav>;
}
