import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function CustomCursor({ soundEnabled, setSoundEnabled }: { soundEnabled: boolean; setSoundEnabled: (val: boolean) => void }) {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.dataset.hoverable === 'true'
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* Background Ambient Noise & Orange Radial Spotlight */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-noise opacity-40" />

      {/* Mouse Follow Glow */}
      <div
        className="pointer-events-none fixed z-10 transition-transform duration-300 ease-out"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="h-96 w-96 rounded-full bg-[#FF5A1F] opacity-[0.07] blur-[100px]" />
      </div>

      {/* Custom Precision Cursor (Visible on desktop pointers) */}
      <div className="hidden lg:block">
        <motion.div
          className="pointer-events-none fixed top-0 left-0 z-50 rounded-full border border-[#FF5A1F]/80 mix-blend-difference"
          animate={{
            x: mousePosition.x - (isHovered ? 24 : 10),
            y: mousePosition.y - (isHovered ? 24 : 10),
            width: isHovered ? 48 : 20,
            height: isHovered ? 48 : 20,
            scale: isClicking ? 0.8 : 1,
            backgroundColor: isHovered ? 'rgba(255, 90, 31, 0.2)' : 'rgba(255, 90, 31, 0)',
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.5 }}
        />
        <motion.div
          className="pointer-events-none fixed top-0 left-0 z-50 h-1.5 w-1.5 rounded-full bg-[#FF5A1F]"
          animate={{
            x: mousePosition.x - 3,
            y: mousePosition.y - 3,
          }}
          transition={{ type: 'spring', damping: 40, stiffness: 600 }}
        />
      </div>
    </>
  );
}
