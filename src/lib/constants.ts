export const WA_NUMBER = "6282176171448";
export const TREATMENT_TYPE = "Treatment Care & Beauty";
export const PRIMARY_GRADIENT = "linear-gradient(135deg,#C94F78,#9B3055)";
export const HERO_GRADIENT = "linear-gradient(160deg,#C94F78 0%,#9B3055 55%,#7A2240 100%)";
export const BANNER_BG = "#FFECF4";

export const CLINIC_ADDRESS =
  "Jl. Hos Cokroaminoto No.17, Kebon Jeruk, Tanjungkarang Timur, Bandar Lampung";
export const CLINIC_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "LBQueen Care & Beauty Clinic, Jl. Hos Cokroaminoto No.17, Tanjungkarang Timur, Bandar Lampung",
)}`;

export const BRAND_BANNERS = [
  {
    src: "/banners/lbqueen-ambassador.webp",
    alt: "LBQueen Care & Beauty Clinic, perawatan kulit dan beauty care",
  },
  {
    src: "/banners/lbqueen-treatment.webp",
    alt: "Skinbooster dan treatment dermatologi bersama dokter LBQueen",
  },
  { src: "/banners/lbqueen-jam-buka.webp", alt: "Jam buka LBQueen Care & Beauty Clinic" },
];

export const waLink = (text: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
