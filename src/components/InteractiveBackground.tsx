"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    angle: number; // Current angle for autonomous drift
    speed: number; // Autonomous speed
    spinSpeed: number; // Speed of swirl
}

export default function InteractiveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0, active: false });
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            const particles: Particle[] = [];
            // High density for the "vortex" feel
            // Lower density for a cleaner look
            const count = Math.floor((canvas.width * canvas.height) / 2000);

            const colors = [
                "rgba(255, 255, 255, 0.4)", // White
                "rgba(200, 240, 255, 0.3)", // Faint Cyan
                "rgba(220, 220, 255, 0.25)", // Faint Blue
                "rgba(255, 255, 255, 0.2)", // Translucent White
            ];

            for (let i = 0; i < count; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                particles.push({
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                    vx: (Math.random() - 0.5) * 0.2, // Initial slow drift
                    vy: (Math.random() - 0.5) * 0.2,
                    radius: Math.random() * 1.5 + 0.5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    angle: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.5 + 0.1,
                    spinSpeed: (Math.random() - 0.5) * 0.02,
                });
            }
            particlesRef.current = particles;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
        };

        const animate = () => {
            // Clear the canvas fully each frame to remove trails
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const isActive = mouseRef.current.active;

            particlesRef.current.forEach((p) => {
                // --- Autonomous Motion ---
                p.angle += 0.01;
                p.vx += Math.cos(p.angle) * 0.01;
                p.vy += Math.sin(p.angle) * 0.01;

                // --- Mouse Interaction ---
                if (isActive) {
                    const dx = mx - p.x;
                    const dy = my - p.y;
                    const distSq = dx * dx + dy * dy;
                    const dist = Math.sqrt(distSq);
                    const maxDist = 250;

                    if (dist < maxDist) {
                        const force = (maxDist - dist) / maxDist;
                        const pullStrength = force * 0.05;

                        // Pull towards mouse
                        p.vx += (dx / dist) * pullStrength;
                        p.vy += (dy / dist) * pullStrength;

                        // Swirl/Vortex component
                        const swirlX = -dy / dist;
                        const swirlY = dx / dist;
                        p.vx += swirlX * force * 0.15;
                        p.vy += swirlY * force * 0.15;
                    }
                }

                // --- Apply Physics ---
                p.x += p.vx;
                p.y += p.vy;

                // Friction/Damping
                p.vx *= 0.98;
                p.vy *= 0.98;

                // --- Screen Wrap ---
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                if (p.y < -10) p.y = canvas.height + 10;
                if (p.y > canvas.height + 10) p.y = -10;

                // --- Draw ---
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);
        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 bg-black"
        />
    );
}
