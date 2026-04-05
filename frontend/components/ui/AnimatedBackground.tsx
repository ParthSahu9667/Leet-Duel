"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  hue: number;
  pulseSpeed: number;
  pulsePhase: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number;
  maxLife: number;
  hue: number;
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Initialize particles
    const PARTICLE_COUNT = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 18000));
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.5 + 0.8,
        opacity: Math.random() * 0.6 + 0.3,
        hue: Math.random() > 0.5 ? 230 + Math.random() * 30 : 180 + Math.random() * 20, // indigo or cyan
        pulseSpeed: 0.01 + Math.random() * 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;

    const meteors: Meteor[] = [];
    meteorsRef.current = meteors;

    const spawnMeteor = () => {
      const side = Math.random();
      let x: number, y: number, vx: number, vy: number;
      if (side < 0.5) {
        // From top
        x = Math.random() * canvas.width;
        y = -20;
        vx = (Math.random() - 0.5) * 3;
        vy = 2 + Math.random() * 4;
      } else {
        // From right
        x = canvas.width + 20;
        y = Math.random() * canvas.height * 0.5;
        vx = -(2 + Math.random() * 4);
        vy = 1 + Math.random() * 2;
      }
      const maxLife = 60 + Math.random() * 80;
      meteors.push({
        x, y, vx, vy,
        length: 30 + Math.random() * 60,
        opacity: 0.6 + Math.random() * 0.4,
        life: 0,
        maxLife,
        hue: Math.random() > 0.3 ? 230 : 190,
      });
    };

    // Animation loop
    const CONNECTION_DIST = 130;
    const MOUSE_RADIUS = 200;

    const animate = () => {
      timeRef.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse repulsion / attraction (gentle)
        const dmx = p.x - mx;
        const dmy = p.y - my;
        const distMouse = Math.sqrt(dmx * dmx + dmy * dmy);
        if (distMouse < MOUSE_RADIUS && distMouse > 0) {
          const force = (1 - distMouse / MOUSE_RADIUS) * 0.015;
          p.vx += (dmx / distMouse) * force;
          p.vy += (dmy / distMouse) * force;
        }

        // Velocity damping
        p.vx *= 0.995;
        p.vy *= 0.995;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Pulsing opacity
        const pulse = Math.sin(timeRef.current * p.pulseSpeed + p.pulsePhase) * 0.35 + 0.75;
        const displayOpacity = p.opacity * pulse;

        // Glow near mouse
        let glowBoost = 0;
        if (distMouse < MOUSE_RADIUS) {
          glowBoost = (1 - distMouse / MOUSE_RADIUS) * 1.0;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + glowBoost * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${Math.min(displayOpacity + glowBoost * 0.7, 1)})`;
        ctx.fill();

        // Outer glow
        if (glowBoost > 0.05) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius + glowBoost * 10, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 85%, 65%, ${glowBoost * 0.3})`;
          ctx.fill();
        }
      }

      // Draw connections
      ctx.lineWidth = 1.2;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.3;

            // Brighten connections near mouse
            const midX = (particles[i].x + particles[j].x) / 2;
            const midY = (particles[i].y + particles[j].y) / 2;
            const distToMouse = Math.sqrt((midX - mx) ** 2 + (midY - my) ** 2);
            const mouseBoost = distToMouse < MOUSE_RADIUS ? (1 - distToMouse / MOUSE_RADIUS) * 0.5 : 0;

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(230, 80%, 75%, ${Math.min(alpha + mouseBoost, 0.8)})`;
            ctx.stroke();
          }
        }
      }

      // Mouse halo
      if (mx > 0 && my > 0) {
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS * 1.3);
        gradient.addColorStop(0, "hsla(230, 85%, 70%, 0.15)");
        gradient.addColorStop(0.4, "hsla(230, 80%, 65%, 0.06)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mx, my, MOUSE_RADIUS * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shooting stars / meteors
      if (Math.random() < 0.012) {
        spawnMeteor();
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life++;

        const lifeRatio = m.life / m.maxLife;
        const fadeIn = Math.min(m.life / 10, 1);
        const fadeOut = lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : 1;
        const alpha = m.opacity * fadeIn * fadeOut;

        if (alpha <= 0 || m.life > m.maxLife) {
          meteors.splice(i, 1);
          continue;
        }

        const speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
        const tailX = m.x - (m.vx / speed) * m.length;
        const tailY = m.y - (m.vy / speed) * m.length;

        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, `hsla(${m.hue}, 85%, 75%, 0)`);
        grad.addColorStop(0.5, `hsla(${m.hue}, 85%, 80%, ${alpha * 0.5})`);
        grad.addColorStop(1, `hsla(${m.hue}, 95%, 90%, ${alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${m.hue}, 95%, 92%, ${alpha})`;
        ctx.fill();
      }

      // Gentle floating orbs (large, very faint)
      const orbCount = 3;
      for (let i = 0; i < orbCount; i++) {
        const phase = (timeRef.current * 0.002 + (i * Math.PI * 2) / orbCount);
        const ox = canvas.width * (0.3 + 0.4 * Math.sin(phase * 0.7 + i));
        const oy = canvas.height * (0.3 + 0.4 * Math.cos(phase * 0.5 + i * 2));
        const orbRadius = 120 + Math.sin(phase) * 40;
        const orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, orbRadius);
        const hue = i === 0 ? 240 : i === 1 ? 280 : 190;
        orbGrad.addColorStop(0, `hsla(${hue}, 85%, 65%, 0.12)`);
        orbGrad.addColorStop(0.4, `hsla(${hue}, 75%, 55%, 0.05)`);
        orbGrad.addColorStop(1, "transparent");
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(ox, oy, orbRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};
