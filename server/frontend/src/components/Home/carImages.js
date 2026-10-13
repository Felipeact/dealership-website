// Image slots for the home page. Drop a file named <slug>.(jpg|png|webp) into
// src/assets/cars/ and it is picked up automatically; missing slots render a
// styled fallback.
const context = require.context("../../assets/cars", false, /\.(png|jpe?g|webp)$/);

const imagesBySlug = Object.fromEntries(
  context.keys().map((key) => [key.replace(/^\.\//, "").replace(/\.\w+$/, ""), context(key)])
);

export const carImage = (slug) => imagesBySlug[slug];
