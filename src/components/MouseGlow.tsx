"use client";

import { useState, type ReactNode } from "react";

interface MouseGlowProps {
  children: ReactNode;
}

export function MouseGlow({ children }: MouseGlowProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY + window.scrollY,
    });
  };

  return (
    <div
      className="group/spotlight relative min-h-screen"
      onMouseMove={handleMouseMove}
    >
      <div
        className="pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 80%)`,
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
