import React, { useEffect, useRef } from 'react';

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let orbs: Orb[] = [];

    // Stronger pastel cold tones for better visibility through blur
    const colors = [
      'rgba(125, 211, 252, 0.8)', // Sky 300
      'rgba(94, 234, 212, 0.8)',  // Teal 300
      'rgba(196, 181, 253, 0.8)', // Violet 300
      'rgba(147, 197, 253, 0.8)', // Blue 300
      'rgba(134, 239, 172, 0.8)', // Green 300
    ];

    const getRandomColor = (exclude?: string) => {
      let newColor = colors[Math.floor(Math.random() * colors.length)];
      if (exclude && colors.length > 1) {
        while (newColor === exclude) {
          newColor = colors[Math.floor(Math.random() * colors.length)];
        }
      }
      return newColor;
    };

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      orbs = [];
      const numOrbs = 6;
      for (let i = 0; i < numOrbs; i++) {
        // Slightly smaller max radius to keep them distinct
        const radius = Math.random() * 150 + 100; // 100-250px radius
        // Ensure orbs spawn fully within bounds
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        
        orbs.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.3, // Slightly increased speed for bounce visibility
          vy: (Math.random() - 0.5) * 0.3,
          radius,
          color: getRandomColor(),
        });
      }
    };

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches[0]) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach(orb => {
        // Natural drift
        orb.x += orb.vx;
        orb.y += orb.vy;

        let bounced = false;

        // Bounce off walls (Left/Right)
        if (orb.x - orb.radius < 0) {
          orb.x = orb.radius; // Reset position to prevent sticking
          orb.vx *= -1;
          bounced = true;
        } else if (orb.x + orb.radius > canvas.width) {
          orb.x = canvas.width - orb.radius;
          orb.vx *= -1;
          bounced = true;
        }

        // Bounce off walls (Top/Bottom)
        if (orb.y - orb.radius < 0) {
          orb.y = orb.radius;
          orb.vy *= -1;
          bounced = true;
        } else if (orb.y + orb.radius > canvas.height) {
          orb.y = canvas.height - orb.radius;
          orb.vy *= -1;
          bounced = true;
        }

        // Change color on bounce
        if (bounced) {
          orb.color = getRandomColor(orb.color);
        }

        // Interactive Repulsion
        const dx = mouseX - orb.x;
        const dy = mouseY - orb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 600; 

        if (distance < interactionRadius) {
            const force = (interactionRadius - distance) / interactionRadius;
            const angle = Math.atan2(dy, dx);
            const pushFactor = 1.0; 
            
            orb.x -= Math.cos(angle) * force * pushFactor;
            orb.y -= Math.sin(angle) * force * pushFactor;
        }

        // Draw
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = orb.color;
        
        ctx.globalCompositeOperation = 'source-over'; 
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    
    // Respect reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (!mediaQuery.matches) {
        window.addEventListener('resize', init);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        animate();
    } else {
        animate(); 
        cancelAnimationFrame(animationFrameId);
    }

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-sand-50 via-white to-sky-50">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full blur-[60px] opacity-70 pointer-events-none"
        />
    </div>
  );
};