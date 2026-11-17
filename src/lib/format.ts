export function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

export function formatRupiah(value: number) {
  return `Rp ${formatNumber(value)}`;
}
