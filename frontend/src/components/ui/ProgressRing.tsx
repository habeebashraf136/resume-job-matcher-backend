import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: 'cyan' | 'pink';
}

export function ProgressRing({ progress, size = 120, strokeWidth = 12, className, color = 'cyan' }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background outline ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--ink)"
          strokeWidth={4}
          fill="transparent"
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color === 'cyan' ? 'var(--cyan)' : 'var(--pink)'}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="square"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
        {/* Border for the arc to make it pop? Wait, SVG outline is tricky, just keep it flat on top of the black track */}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-mono font-bold text-ink">{progress}%</span>
      </div>
    </div>
  );
}
