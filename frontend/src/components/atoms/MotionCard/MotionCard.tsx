import React from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { fadeUpVariants, cardHoverVariants } from '../../../lib/motion';

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  enableHover?: boolean;
}

/**
 * MotionCard — scroll-reveal card wrapper.
 * Fades up when entering viewport, lifts on hover.
 * Wrap any card JSX with this to get premium scroll reveal + hover.
 */
export const MotionCard: React.FC<MotionCardProps> = ({
  children,
  className = '',
  delay = 0,
  enableHover = true,
}) => {
  const { ref, isInView } = useScrollReveal({ threshold: 0.08 });

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={fadeUpVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      custom={delay}
      whileHover={enableHover ? cardHoverVariants.hover : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default MotionCard;
