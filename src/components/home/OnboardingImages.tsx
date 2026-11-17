import Image from "next/image";

export const ONBOARDING_IMAGES = ["/onboarding_1.jpg", "/onboarding_2.jpg"];

export function OnboardingImages({ active, desktop }: { active: number; desktop: boolean }) {
  return ONBOARDING_IMAGES.map((src, idx) => (
    <Image
      key={src}
      src={src}
      alt={`LBQueen Care ${idx + 1}`}
      fill
      className={
        desktop
          ? `object-cover transition-all duration-[1200ms] ease-in-out ${
              active === idx ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-105 rotate-1"
            }`
          : `object-cover transition-all duration-1000 ${
              active === idx ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`
      }
      priority={idx === 0}
    />
  ));
}
