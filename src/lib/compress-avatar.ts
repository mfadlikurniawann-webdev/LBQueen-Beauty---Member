/**
 * Foto profil dikecilkan di perangkat sebelum diunggah: potong persegi di tengah,
 * maksimal 512x512, WebP. Kualitas diturunkan bertahap sampai di bawah 150 KB.
 */
export async function compressAvatar(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const size = Math.min(512, side);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Perangkat tidak dapat memproses foto.");
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  bitmap.close();
  for (const quality of [0.8, 0.7, 0.6, 0.5]) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
    if (blob && blob.type === "image/webp" && blob.size <= 150 * 1024) return blob;
    if (blob && blob.type !== "image/webp") break;
  }
  throw new Error("Foto terlalu besar. Coba foto lain.");
}
