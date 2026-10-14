import React from 'react';
import logoImage from './image/regenerated_image_1785757234835.png';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export default function Logo({
  className = "h-9 w-9",
  size,
  showText = false,
  textClassName = "font-syne text-xl font-bold tracking-wider text-white"
}: LogoProps) {
  return (
    <div className="inline-flex items-center gap-3 select-none">
      <img
        src={logoImage}
        alt="Logo"
        referrerPolicy="no-referrer"
        className={`${className} object-cover rounded-full`}
        style={size ? { width: size, height: size } : undefined}
      />

      {showText && (
        <span className={textClassName}>
          NIHAL
        </span>
      )}
    </div>
  );
}
