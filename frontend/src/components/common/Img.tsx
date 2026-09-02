import type { ImgHTMLAttributes } from 'react';
import { imageSources } from '@/utils/images';

interface ImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string | undefined | null;
  alt: string;
  /**
   * Rendered width of the slot, so the browser can pick a variant before layout.
   * Omitting it means "full viewport width", which all but guarantees the
   * largest variant — always pass one for anything smaller than the page.
   */
  sizes?: string;
}

/**
 * `<img>` that resolves a master image path to its responsive WebP variants.
 * Paths outside the manifest render unchanged, so external URLs are safe.
 */
export default function Img({ src, alt, sizes, ...rest }: ImgProps) {
  const resolved = imageSources(src);

  return <img {...rest} src={resolved.src} srcSet={resolved.srcSet} sizes={resolved.srcSet ? sizes : undefined} alt={alt} />;
}
