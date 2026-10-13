import React from "react";
import { carImage } from "./carImages";

// Renders the generated image for `slug`, or a styled placeholder until one exists.
const CarImage = ({ slug, alt, className = "" }) => {
  const src = carImage(slug);

  if (src) {
    return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} />;
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex h-full w-full items-end justify-center bg-gradient-to-br from-accent/25 via-default to-background-secondary ${className}`}
    >
      <svg viewBox="0 0 240 90" className="mb-[8%] w-3/5 text-foreground/25" fill="currentColor" aria-hidden="true">
        <path d="M18 62c0-9 6-14 16-16l30-6 26-18c6-4 12-6 20-6h46c8 0 14 3 19 8l18 16 26 4c11 2 17 8 17 18v6c0 4-3 6-6 6h-14a24 24 0 0 0-47 0H80a24 24 0 0 0-47 0H24c-4 0-6-2-6-6Zm86-40-22 16h52V18h-18c-5 0-9 1-12 4Zm40-4v20h48l-14-13c-3-4-7-7-13-7Z" />
        <circle cx="56" cy="70" r="16" />
        <circle cx="182" cy="70" r="16" />
      </svg>
    </div>
  );
};

export default CarImage;
