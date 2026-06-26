import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { imageVariants } from '../../../lib/motion';

interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  hoverZoom?: boolean;
}

/**
 * AnimatedImage — a drop-in <img> replacement with:
 *  - Shimmer skeleton placeholder while loading
 *  - Fade-in + scale(0.96 → 1) on load
 *  - Optional hover zoom (1.04) with brightness increase
 *  - Always lazy-loads
 */
export const AnimatedImage: React.FC<AnimatedImageProps> = ({
  src,
  alt,
  className = '',
  skeletonClassName = '',
  objectFit = 'cover',
  hoverZoom = true,
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Shimmer skeleton */}
      {!loaded && (
        <div
          className={`absolute inset-0 animate-skeleton rounded-inherit ${skeletonClassName}`}
          aria-hidden
        />
      )}

      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        variants={imageVariants}
        initial="hidden"
        animate={loaded ? 'visible' : 'hidden'}
        whileHover={
          hoverZoom
            ? { scale: 1.04, filter: 'brightness(1.06)', transition: { duration: 0.3 } }
            : undefined
        }
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          display: 'block',
        }}
      />
    </div>
  );
};

export default AnimatedImage;
