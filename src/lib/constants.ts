export const WA_NUMBER = "6282176171448";
export const TREATMENT_TYPE = "Treatment Care & Beauty";
export const PRIMARY_GRADIENT = "linear-gradient(135deg,#C94F78,#9B3055)";
export const HERO_GRADIENT = "linear-gradient(160deg,#C94F78 0%,#9B3055 55%,#7A2240 100%)";
export const BANNER_BG = "#FFECF4";

export const CLINIC_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "LBQueen Care & Beauty Clinic, Jl. Hos Cokroaminoto No.17, Tanjungkarang Timur, Bandar Lampung",
)}`;

export const BRAND_BANNERS = [
  {
    src: "/banners/lbqueen-percaya-diri.webp",
    alt: "Tampil lebih percaya diri dengan LBQueen, perawatan profesional untuk kecantikanmu",
  },
  {
    src: "/banners/lbqueen-perawatan-lengkap.webp",
    alt: "Perawatan kecantikan lengkap di LBQueen: facial, body care, laser, dan treatment",
  },
  {
    src: "/banners/lbqueen-tenaga-medis.webp",
    alt: "Tenaga medis profesional LBQueen dengan pelayanan ramah dan terstandar",
  },
  {
    src: "/banners/lbqueen-investasi-kecantikan.webp",
    alt: "Investasi kecantikan terbaik untuk kulit sehat dan penampilan lebih menawan",
  },
];

export const waLink = (text: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
