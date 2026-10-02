import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const STAGES = [
  { id: 1, text: "Reading your PDF", time: 2000 },
  { id: 2, text: "Understanding your skills and experience", time: 8000 },
  { id: 3, text: "Searching live job listings", time: 14000 },
  { id: 4, text: "Comparing meaning with embeddings", time: 22000 },
  { id: 5, text: "AI re-ranking for role, experience and location", time: 32000 },
  { id: 6, text: "Saving your results", time: 40000 },
];

interface PipelineProps {
  isComplete: boolean;
  onCancel: () => void;
}

export function Pipeline({ isComplete, onCancel }: PipelineProps) {
  const [activeStage, setActiveStage] = useState(0); 

  useEffect(() => {
    if (isComplete) {
      setActiveStage(STAGES.length);
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      
      let current = 0;
      for (let i = 0; i < STAGES.length; i++) {
        if (elapsed > STAGES[i].time) {
          current = i + 1;
        }
      }
      if (current >= STAGES.length) {
        current = STAGES.length - 1; 
      }
      setActiveStage(current);
    }, 500);

    return () => clearInterval(interval);
  }, [isComplete]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="w-full"
      >
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 bg-yellow border-b-2 border-ink">
            <div>
              <h2 className="text-xl font-display font-bold text-ink">AI Pipeline Active</h2>
              <p className="text-xs text-ink uppercase tracking-widest mt-1 font-bold">Estimated progress</p>
            </div>
            {!isComplete && (
              <Button variant="secondary" size="sm" onClick={onCancel} className="text-ink">
                <X size={16} className="mr-1 text-ink" /> Abort
              </Button>
            )}
          </div>

          <div className="p-6">
            <div className="w-full h-4 neo-border rounded-neo bg-surface mb-6 overflow-hidden relative">
              <div 
                className="h-full bg-cyan transition-all duration-1000 ease-out border-r-2 border-ink" 
                style={{ 
                  width: isComplete ? '100%' : `${((activeStage + 1) / STAGES.length) * 100}%`
                }} 
              />
            </div>

            <div className="flex flex-col gap-3" aria-live="polite" aria-atomic="true">
              {STAGES.map((stage, index) => {
                const isPast = isComplete || activeStage > index;
                const isCurrent = !isComplete && activeStage === index;
                
                return (
                  <div key={stage.id} className="flex items-center gap-4 p-3 neo-border rounded-neo bg-surface">
                    <div 
                      className={`w-6 h-6 shrink-0 neo-border rounded-sm flex items-center justify-center transition-colors duration-[120ms] ${
                        isPast ? 'bg-pink' : isCurrent ? 'bg-yellow' : 'bg-surface'
                      }`}
                    >
                      {isPast && <Check size={16} strokeWidth={4} className="text-ink" />}
                    </div>
                    
                    <div className="flex-1 text-sm font-bold text-ink">
                      {stage.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
