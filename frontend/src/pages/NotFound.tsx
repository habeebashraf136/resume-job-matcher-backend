import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Starfield } from '../components/Starfield';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg">
      <Starfield />
      
      <div className="relative z-10 w-full max-w-lg">
        <Card className="flex flex-col w-full p-12 text-center items-center bg-surface">
          <h1 className="text-9xl font-display font-bold text-ink mb-2">404</h1>
          <h2 className="text-2xl font-bold text-ink mb-6">Page Not Found</h2>
          <p className="text-ink font-medium mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/app" className="w-full">
            <Button variant="primary" className="w-full">
              Go Home
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
