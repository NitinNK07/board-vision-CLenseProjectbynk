import { useEffect, useRef } from 'react';

/**
 * FloatingChessPieces — 3D dynamic wavy floating chess pieces animation
 * Uses pure CSS animations + canvas for a premium, eye-catching effect
 * on Login/Signup pages
 */
const CHESS_PIECES = [
  { symbol: '♚', name: 'King', size: 72, color: '#FFD700' },
  { symbol: '♛', name: 'Queen', size: 68, color: '#E8B4F8' },
  { symbol: '♞', name: 'Knight', size: 60, color: '#7DD3FC' },
  { symbol: '♜', name: 'Rook', size: 56, color: '#86EFAC' },
  { symbol: '♝', name: 'Bishop', size: 54, color: '#FCA5A5' },
  { symbol: '♟', name: 'Pawn', size: 44, color: '#FDA4AF' },
];

const FloatingChessPieces = () => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Create floating particles
    const particles = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * 600,
        y: Math.random() * 800,
        r: Math.random() * 2.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }

    // Create floating chess pieces with extra WAVY motion
    const pieces = CHESS_PIECES.map((p, i) => ({
      ...p,
      x: 80 + Math.random() * (400),
      y: 60 + i * 110 + Math.random() * 40,
      baseX: 80 + Math.random() * 400,
      baseY: 60 + i * 110,
      phase: (i * Math.PI) / 2.5,
      speed: 0.5 + Math.random() * 0.5,
      amplitude: 35 + Math.random() * 30,
      rotationPhase: Math.random() * Math.PI * 2,
      waveFreq2: 0.3 + Math.random() * 0.4,
      waveFreq3: 0.15 + Math.random() * 0.2,
      scale: 0.9 + Math.random() * 0.3,
      shadowBlur: 15 + Math.random() * 10,
    }));

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());
      t += 0.012;

      // Draw particles
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > W()) p.dx *= -1;
        if (p.y < 0 || p.y > H()) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 130, 255, ${p.alpha})`;
        ctx.fill();
      });

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(168, 130, 255, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw floating chess pieces with compound wavy effect
      pieces.forEach((p, i) => {
        // Compound wave: 3 sine waves at different frequencies for organic motion
        const wave1X = Math.sin(t * p.speed + p.phase) * p.amplitude;
        const wave2X = Math.sin(t * p.waveFreq2 + p.phase * 1.5) * (p.amplitude * 0.4);
        const wave3X = Math.cos(t * p.waveFreq3 + p.rotationPhase) * (p.amplitude * 0.25);
        const waveX = wave1X + wave2X + wave3X;

        const wave1Y = Math.cos(t * p.speed * 0.7 + p.phase) * (p.amplitude * 0.7);
        const wave2Y = Math.sin(t * p.waveFreq2 * 1.3 + p.phase * 0.8) * (p.amplitude * 0.3);
        const wave3Y = Math.cos(t * p.waveFreq3 * 0.9 + p.rotationPhase) * (p.amplitude * 0.2);
        const waveY = wave1Y + wave2Y + wave3Y;

        const x = p.baseX + waveX;
        const y = p.baseY + waveY;

        // 3D perspective tilt
        const tiltX = Math.sin(t * 0.5 + p.rotationPhase) * 0.15;
        const scaleWave = p.scale + Math.sin(t * 0.8 + p.phase) * 0.08;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scaleWave, scaleWave * (1 - Math.abs(tiltX) * 0.3));

        // Glow shadow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.shadowBlur + Math.sin(t * 2 + p.phase) * 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Draw piece symbol
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Gradient fill for 3D look
        const grad = ctx.createLinearGradient(0, -p.size / 2, 0, p.size / 2);
        grad.addColorStop(0, p.color);
        grad.addColorStop(0.5, '#ffffff');
        grad.addColorStop(1, p.color);
        ctx.fillStyle = grad;
        ctx.fillText(p.symbol, 0, 0);

        // Outline for depth
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
        ctx.lineWidth = 0.5;
        ctx.strokeText(p.symbol, 0, 0);

        ctx.restore();
      });

      // Draw subtle chessboard grid in background
      ctx.save();
      ctx.globalAlpha = 0.03;
      const gridSize = 60;
      for (let gx = 0; gx < W(); gx += gridSize) {
        for (let gy = 0; gy < H(); gy += gridSize) {
          if ((Math.floor(gx / gridSize) + Math.floor(gy / gridSize)) % 2 === 0) {
            ctx.fillStyle = '#a882ff';
            ctx.fillRect(gx, gy, gridSize, gridSize);
          }
        }
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl" style={{
      background: 'linear-gradient(135deg, #1a1035 0%, #2d1b69 30%, #1e1145 60%, #13082a 100%)',
    }}>
      {/* Animated canvas layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Radial glow overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(168,130,255,0.6) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(125,211,252,0.6) 0%, transparent 70%)',
            animation: 'pulse 5s ease-in-out infinite 1s',
          }}
        />
      </div>

      {/* Bottom text overlay */}
      <div className="absolute bottom-8 left-8 right-8 text-white z-10">
        <h2 className="text-3xl font-bold mb-2" style={{
          textShadow: '0 2px 20px rgba(168,130,255,0.5)',
        }}>
          Master Your Game
        </h2>
        <p className="text-lg text-purple-200/80 leading-relaxed">
          Scan scoresheets • Analyze positions • Train tactics
        </p>
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.3); opacity: 0.35; }
        }
      `}</style>
    </div>
  );
};

export default FloatingChessPieces;
