import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { Starfield } from '../components/Starfield';

const registerSchema = z.object({
  username: z.string().min(1, "Username is required").trim(),
  email: z.string().email("Invalid email address").trim(),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/\d/, "Password must contain at least one number")
    .trim()
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const navigate = useNavigate();
  const { error, success } = useToast();
  const setAuth = useAuthStore(state => state.setAuth);
  const reducedMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '' }
  });

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    if (cooldown > 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/api/auth/register', data);
      
      const { user, accessToken, message } = response.data;
      
      success(message || "Account created successfully!");
      
      setAuth(accessToken, { id: user.id, username: user.username, email: user.email });
      
      setTimeout(() => {
         navigate('/app');
      }, 800);
    } catch (err: any) {
      if (err.response?.status === 429) {
        error(err.response.data.message || 'Too many attempts. Try again after an hour.');
        setCooldown(3600); 
      } else if (err.response?.status === 400) {
        triggerShake();
        if (err.response.data.errors) {
           error(err.response.data.errors[0].msg);
        } else {
           error(err.response.data.message || 'Registration failed.');
        }
      } else {
        error('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg">
      <Starfield />
      
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          animate={
            isShaking && !reducedMotion
              ? { x: [-10, 10, -10, 10, 0] } 
              : {}
          }
          transition={
            isShaking ? { duration: 0.4 } : {}
          }
        >
          <Card className="flex flex-col w-full p-0 overflow-hidden">
            <div className="text-center bg-yellow border-b-2 border-ink p-6 mb-6">
              <h1 className="text-3xl font-display font-bold text-ink">
                Create Account
              </h1>
              <p className="text-ink font-medium text-sm mt-2">
                Join the future of job matching.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">
              <div className="space-y-1">
                <Input
                  placeholder="Username"
                  {...register('username')}
                  error={errors.username?.message}
                  disabled={isSubmitting || cooldown > 0}
                />
              </div>

              <div className="space-y-1">
                <Input
                  type="email"
                  placeholder="Email address"
                  {...register('email')}
                  error={errors.email?.message}
                  disabled={isSubmitting || cooldown > 0}
                />
              </div>

              <div className="space-y-1 relative">
                <div className="relative flex items-center">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    {...register('password')}
                    error={errors.password?.message}
                    disabled={isSubmitting || cooldown > 0}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1.5 w-9 h-9 flex items-center justify-center bg-purple neo-border rounded-circle text-[#111111] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[2px_2px_0_var(--ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <AnimatePresence>
                {cooldown > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-danger neo-border text-ink p-3 rounded-neo text-sm font-bold text-center neo-shadow-sm mt-4"
                  >
                    Too many attempts. Please wait an hour.
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full mt-6" 
                isLoading={isSubmitting}
                disabled={isSubmitting || cooldown > 0}
              >
                {isSubmitting ? "Creating Account..." : "Register"}
              </Button>
            </form>

            <div className="text-center text-sm font-bold text-ink p-4 border-t-2 border-ink bg-surface">
              Already have an account?{' '}
              <Link to="/login" className="text-ink hover:text-cyan underline decoration-2 underline-offset-4 transition-colors">
                Log in
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
