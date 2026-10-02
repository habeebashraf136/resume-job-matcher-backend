import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { motion } from 'framer-motion';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, setLoading, setAuth, clearAuth } = useAuthStore();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Try to get new token and user
        const { data: refreshData } = await apiClient.get('/api/auth/get-refresh');
        const token = refreshData.accessToken;
        
        const { data: userData } = await apiClient.get('/api/auth/get-user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const normalizedUser = {
          id: userData.user.userid || userData.user.id,
          username: userData.user.username,
          email: userData.user.email
        };
        setAuth(token, normalizedUser);
      } catch (error) {
        clearAuth();
      } finally {
        setLoading(false);
        setInitialCheckDone(true);
      }
    };

    if (!isLoading) {
      setInitialCheckDone(true);
    } else if (!initialCheckDone) {
      restoreSession();
    }
  }, [isLoading, initialCheckDone, setAuth, clearAuth, setLoading]);

  if (isLoading || !initialCheckDone) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4"
        />
        <p className="text-muted-foreground font-display tracking-widest uppercase text-sm animate-pulse">Initializing System</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
