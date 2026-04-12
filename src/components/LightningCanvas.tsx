import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface LightningCanvasHandle {
  triggerLightning: () => void;
}

function drawBoltSegment(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  displacement: number,
  depth: number,
) {
  if (depth <= 0) {
    context.lineTo(endX, endY);
    return;
  }

  const midX = (startX + endX) / 2 + (Math.random() - 0.5) * displacement;
  const midY = (startY + endY) / 2 + (Math.random() - 0.5) * displacement;

  drawBoltSegment(context, startX, startY, midX, midY, displacement * 0.62, depth - 1);
  drawBoltSegment(context, midX, midY, endX, endY, displacement * 0.62, depth - 1);

  if (depth > 2 && Math.random() < 0.35) {
    context.moveTo(midX, midY);
    const branchX = midX + (Math.random() - 0.5) * displacement * 1.4;
    const branchY = midY + Math.random() * displacement;
    drawBoltSegment(context, midX, midY, branchX, branchY, displacement * 0.4, depth - 2);
  }
}

export const LightningCanvas = forwardRef<LightningCanvasHandle>(function LightningCanvas(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const clearTimerRef = useRef<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (clearTimerRef.current !== null) {
        window.clearTimeout(clearTimerRef.current);
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    triggerLightning: () => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');

      if (!canvas || !context) {
        return;
      }

      const width = canvas.width;
      const height = canvas.height;

      context.clearRect(0, 0, width, height);
      setIsFlashing(true);

      const boltCount = 2 + Math.floor(Math.random() * 2);

      for (let bolt = 0; bolt < boltCount; bolt += 1) {
        const startX = width * (0.2 + Math.random() * 0.6);
        const startY = Math.random() * height * 0.18;
        const endX = width * (0.08 + Math.random() * 0.84);
        const endY = height * (0.45 + Math.random() * 0.4);

        context.save();
        context.beginPath();
        context.moveTo(startX, startY);
        drawBoltSegment(context, startX, startY, endX, endY, 110, 5);
        context.strokeStyle = 'rgba(180, 200, 255, 0.9)';
        context.lineWidth = 1.8;
        context.shadowBlur = 18;
        context.shadowColor = 'rgba(190, 220, 255, 0.95)';
        context.stroke();

        context.beginPath();
        context.moveTo(startX, startY);
        drawBoltSegment(context, startX, startY, endX, endY, 110, 5);
        context.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        context.lineWidth = 3.8;
        context.shadowBlur = 30;
        context.shadowColor = 'rgba(212, 233, 255, 0.95)';
        context.stroke();
        context.restore();
      }

      if (clearTimerRef.current !== null) {
        window.clearTimeout(clearTimerRef.current);
      }

      clearTimerRef.current = window.setTimeout(() => {
        context.clearRect(0, 0, width, height);
        setIsFlashing(false);
      }, 300);
    },
  }));

  return (
    <>
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-40" />
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed inset-0 z-40 bg-white"
          />
        )}
      </AnimatePresence>
    </>
  );
});

