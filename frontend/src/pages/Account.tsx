import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';

export default function Account() {
  const user = useAuthStore(state => state.user);

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl relative bg-bg min-h-[calc(100vh-64px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-display font-bold text-ink mb-8 uppercase">
          Account Settings
        </h1>

        <Card className="p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-neo bg-pink border-2 border-ink flex items-center justify-center text-3xl sm:text-4xl font-display font-bold text-ink neo-shadow-sm shrink-0"
            >
              {user ? getInitials(user.username) : 'U'}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-4 pt-2">
              <div>
                <h2 className="text-2xl font-bold text-ink mb-1">{user?.username}</h2>
                <p className="text-ink font-medium">{user?.email}</p>
              </div>

              <div className="mt-6 w-full max-w-sm">
                <div className="bg-yellow border-2 border-ink rounded-neo p-4 neo-shadow-sm">
                  <p className="text-xs text-ink uppercase tracking-wider font-bold mb-2">User ID</p>
                  <p className="text-sm font-mono font-bold truncate text-ink">{user?.id}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
