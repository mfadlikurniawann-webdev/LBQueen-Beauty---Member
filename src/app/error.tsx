"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div role="alert" className="mx-auto my-12 max-w-lg rounded-[32px] border border-[#EEDFE3] bg-white p-8 text-center"><h1 className="text-2xl font-semibold">Halaman belum dapat dimuat</h1><p className="mt-3 mb-6 text-sm text-[#766B68]">Silakan coba kembali. Jika masalah berlanjut, hubungi pengelola LBQueen.</p><button className="btn-pink" onClick={reset}>Coba lagi</button></div>;
}
