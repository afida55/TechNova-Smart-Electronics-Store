import { useState } from "react";

/**
 * Consistent product photo well: contain-fit, reserved aspect ratio, broken-src fallback.
 * Optional className can add hover:scale-105 for zoom effects.
 */
export default function ProductImage({ src, alt = "", className = "" }) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;

  return (
    <div className={`product-image-frame ${className}`.trim()}>
      {showImg ? (
        <img
          src={src}
          alt={alt || "Product image"}
          onError={() => setFailed(true)}
          className="w-full h-full object-contain transition"
        />
      ) : (
        <div className="product-image-fallback" aria-hidden="true" />
      )}
    </div>
  );
}