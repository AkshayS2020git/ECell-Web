import type { StaticImageData } from "next/image";

declare module "*.png" {
  const source: StaticImageData;
  export default source;
}

declare module "*.jpg" {
  const source: StaticImageData;
  export default source;
}

declare module "*.jpeg" {
  const source: StaticImageData;
  export default source;
}

declare module "*.webp" {
  const source: StaticImageData;
  export default source;
}

declare module "*.avif" {
  const source: StaticImageData;
  export default source;
}

declare module "*.svg" {
  const source: string;
  export default source;
}
