import React from 'react';
import { motion, Variants } from 'motion/react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 35, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function AnimatedSection({ children, className = '', id, delay = 0 }: AnimatedSectionProps) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: "-40px" }}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.8,
            delay,
            ease: [0.16, 1, 0.3, 1],
            staggerChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
