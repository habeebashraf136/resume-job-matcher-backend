import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Tooltip } from '../components/ui/Tooltip';
import { useToast } from '../hooks/useToast';
import { Starfield } from '../components/Starfield';
import { motion } from 'framer-motion';

export default function Placeholder() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const { error, success } = useToast();

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen relative p-8">
      {isDark && <Starfield />}
      
      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        <header className="flex justify-between items-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"
          >
            Resume Job Matcher Design System
          </motion.h1>
          <Button variant="outline" onClick={toggleTheme}>
            Toggle Theme
          </Button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col gap-4">
            <h2 className="text-xl font-display font-semibold mb-2">Buttons</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" isLoading>Loading</Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-6">
            <h2 className="text-xl font-display font-semibold">Badges & Tooltips</h2>
            
            <div className="space-y-3">
              <span className="text-sm text-muted-foreground font-medium">Status Badges</span>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="warning">Warning</Badge>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-sm text-muted-foreground font-medium">Interactive Tooltips</span>
              <div>
                <Tooltip content="Floating information!">
                  <Badge variant="outline" className="cursor-help">Hover me for info</Badge>
                </Tooltip>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="text-xl font-display font-semibold mb-2">Toasts & Modals</h2>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" onClick={() => success("Operation successful!")}>Success Toast</Button>
              <Button variant="outline" onClick={() => error("Failed to match jobs.")}>Error Toast</Button>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 md:col-span-2">
            <h2 className="text-xl font-display font-semibold mb-2">Forms & Inputs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="Standard input..." />
              <Input placeholder="Error state..." error="This field is required." />
              <Input type="password" placeholder="Password..." />
              <Button className="w-full">Submit</Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 items-center justify-center">
            <h2 className="text-xl font-display font-semibold mb-2 self-start">Progress</h2>
            <ProgressRing progress={85} />
          </Card>

          <Card className="flex flex-col gap-4 col-span-full">
            <h2 className="text-xl font-display font-semibold mb-2">Loading States (Skeletons)</h2>
            <div className="flex gap-4 items-center">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-32 w-full mt-4" />
          </Card>
        </section>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="System Alert">
        <p className="text-muted-foreground mb-6">
          This is a glassmorphism modal with soft glow effects. It locks the background scroll and animates in using Framer Motion.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
        </div>
      </Modal>
    </div>
  );
}
