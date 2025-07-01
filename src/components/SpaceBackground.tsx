import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star particles
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
      twinkleSpeed: number;
      twinklePhase: number;
    }> = [];

    // Create stars
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    // Shooting stars
    const shootingStars: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      length: number;
      opacity: number;
      life: number;
    }> = [];

    // Create shooting star
    const createShootingStar = () => {
      if (Math.random() < 0.003) {
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * 3 + 2,
          length: Math.random() * 80 + 20,
          opacity: 1,
          life: 1
        });
      }
    };

    // Nebula particles
    const nebulaParticles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      opacity: number;
      drift: number;
    }> = [];

    // Create nebula
    for (let i = 0; i < 50; i++) {
      nebulaParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 100 + 50,
        color: ['#8B5CF6', '#3B82F6', '#EC4899', '#10B981'][Math.floor(Math.random() * 4)],
        opacity: Math.random() * 0.1 + 0.02,
        drift: Math.random() * 0.5 + 0.1
      });
    }

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.016;
      
      // Clear canvas with space gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0F0F23');
      gradient.addColorStop(0.3, '#1a1a2e');
      gradient.addColorStop(0.7, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebula
      nebulaParticles.forEach(particle => {
        particle.x += Math.sin(time * particle.drift) * 0.2;
        particle.y += Math.cos(time * particle.drift * 0.7) * 0.1;
        
        // Wrap around screen
        if (particle.x > canvas.width + 100) particle.x = -100;
        if (particle.x < -100) particle.x = canvas.width + 100;
        if (particle.y > canvas.height + 100) particle.y = -100;
        if (particle.y < -100) particle.y = canvas.height + 100;

        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, particle.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
          particle.x - particle.size,
          particle.y - particle.size,
          particle.size * 2,
          particle.size * 2
        );
      });

      // Draw stars
      stars.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.fill();
        
        // Add star glow
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle * 0.1})`;
          ctx.fill();
        }
      });

      // Create shooting stars
      createShootingStar();

      // Draw shooting stars
      shootingStars.forEach((star, index) => {
        star.x += star.vx;
        star.y += star.vy;
        star.life -= 0.01;
        star.opacity = star.life;

        if (star.life <= 0) {
          shootingStars.splice(index, 1);
          return;
        }

        const gradient = ctx.createLinearGradient(
          star.x, star.y,
          star.x - star.vx * star.length / 10, star.y - star.vy * star.length / 10
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.vx * star.length / 10, star.y - star.vy * star.length / 10);
        ctx.stroke();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Static Space Elements */}
      <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        {/* Large Galaxy */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 200, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-10 right-10 w-32 h-32 sm:w-48 sm:h-48 opacity-20"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-blue-600/30 blur-xl" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-400/40 via-pink-400/30 to-blue-400/40 blur-lg" />
          <div className="absolute inset-8 rounded-full bg-gradient-to-r from-white/20 via-purple-300/30 to-blue-300/20 blur-md" />
        </motion.div>

        {/* Small Galaxy */}
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            rotate: { duration: 150, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-20 left-10 w-20 h-20 sm:w-32 sm:h-32 opacity-15"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-600/30 via-cyan-500/20 to-purple-600/30 blur-lg" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-400/40 via-cyan-400/30 to-purple-400/40 blur-md" />
        </motion.div>

        {/* Distant Moon */}
        <motion.div
          animate={{ 
            y: [-10, 10, -10],
            x: [-5, 5, -5]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/4 left-1/4 w-16 h-16 sm:w-24 sm:h-24 opacity-30"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-300/40 to-gray-600/60 shadow-2xl">
            {/* Moon craters */}
            <div className="absolute top-2 left-3 w-2 h-2 rounded-full bg-gray-700/40" />
            <div className="absolute bottom-3 right-2 w-1.5 h-1.5 rounded-full bg-gray-700/30" />
            <div className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-gray-700/50 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          {/* Moon glow */}
          <div className="absolute inset-0 rounded-full bg-white/10 blur-md scale-150" />
        </motion.div>

        {/* Crescent Moon */}
        <motion.div
          animate={{ 
            rotate: [0, 5, 0, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/3 right-1/3 w-12 h-12 sm:w-20 sm:h-20 opacity-25"
        >
          <div className="relative w-full h-full">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200/60 to-orange-300/40" />
            <div className="absolute top-0 right-0 w-3/4 h-full rounded-full bg-gray-900/80" />
            {/* Crescent glow */}
            <div className="absolute inset-0 rounded-full bg-yellow-200/20 blur-lg scale-125" />
          </div>
        </motion.div>

        {/* Floating Asteroids */}
        <motion.div
          animate={{ 
            x: [0, 20, 0],
            y: [0, -15, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute bottom-1/3 right-1/4 w-3 h-3 sm:w-4 sm:h-4 opacity-40"
        >
          <div className="w-full h-full bg-gray-500/60 transform rotate-45" />
        </motion.div>

        <motion.div
          animate={{ 
            x: [0, -30, 0],
            y: [0, 25, 0],
            rotate: [0, -270, -360]
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-2/3 left-1/3 w-2 h-2 sm:w-3 sm:h-3 opacity-30"
        >
          <div className="w-full h-full bg-gray-400/50 rounded-sm transform rotate-12" />
        </motion.div>

        {/* Distant Planets */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/2 left-10 w-8 h-8 sm:w-12 sm:h-12"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-red-400/30 to-orange-600/40" />
          <div className="absolute inset-0 rounded-full bg-red-300/10 blur-md scale-150" />
        </motion.div>

        <motion.div
          animate={{ 
            scale: [1, 0.9, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ 
            duration: 18, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute bottom-1/4 right-20 w-6 h-6 sm:w-10 sm:h-10"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400/40 to-cyan-600/30" />
          <div className="absolute inset-0 rounded-full bg-blue-300/10 blur-lg scale-125" />
        </motion.div>

        {/* Cosmic Dust Clouds */}
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5 blur-3xl"
        />

        <motion.div
          animate={{ 
            x: [0, -30, 0],
            opacity: [0.03, 0.1, 0.03]
          }}
          transition={{ 
            duration: 35, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute bottom-0 right-0 w-2/3 h-1/2 bg-gradient-to-l from-pink-600/5 via-transparent to-purple-600/5 blur-3xl"
        />
      </div>

      {/* Overlay for better content readability */}
      <div 
        className="fixed inset-0 bg-gradient-to-b from-transparent via-gray-900/10 to-gray-900/20" 
        style={{ zIndex: 2 }}
      />
    </>
  );
};

export default SpaceBackground;