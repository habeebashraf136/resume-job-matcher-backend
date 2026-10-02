import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { Starfield } from '../components/Starfield';

const loginSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/\d/, "Password must contain at least one number")
    .trim(),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { error, success } = useToast();
  const setAuth = useAuthStore(state => state.setAuth);
  const reducedMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false }
  });

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('rememberedEmail');
      if (savedEmail) {
        setValue('email', savedEmail);
        setValue('rememberMe', true);
      }
    } catch (err) {}
  }, [setValue]);

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

  const onSubmit = async (data: LoginFormValues) => {
    if (cooldown > 0) return;
    
    setIsSubmitting(true);
    try {
      try {
        if (data.rememberMe) {
          localStorage.setItem('rememberedEmail', data.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
      } catch (err) {}

      const response = await apiClient.post('/api/auth/login', {
        email: data.email,
        password: data.password
      });
      
      const { user, accessToken, message } = response.data;
      
      success(message || "Logged in successfully!");
      
      const normalizedUser = {
        id: user.userid || user.id,
        username: user.username,
        email: user.email
      };
      
      setAuth(accessToken, normalizedUser);
      
      const from = location.state?.from?.pathname || '/app';
      setTimeout(() => navigate(from, { replace: true }), 800);

    } catch (err: any) {
      if (err.response?.status === 429) {
        error(err.response.data.message || 'Too many attempts. Try again after an hour.');
        setCooldown(3600);
      } else if (err.response?.status === 400 || err.response?.status === 401) {
        triggerShake();
        if (err.response.data.errors) {
           error(err.response.data.errors[0].msg);
        } else {
           error(err.response.data.message || 'Invalid credentials.');
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
                Welcome Back
              </h1>
              <p className="text-ink font-medium text-sm mt-2">
                Enter your credentials to access your account.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">
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
              
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-ink group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-5 h-5 neo-border rounded-sm bg-surface checked:bg-pink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink"
                      {...register('rememberMe')}
                      disabled={isSubmitting || cooldown > 0}
                    />
                    <Check size={14} strokeWidth={4} className="absolute text-ink pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  Remember me
                </label>
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
                {isSubmitting ? "Logging in..." : "Log in"}
              </Button>
            </form>

            <div className="text-center text-sm font-bold text-ink p-4 border-t-2 border-ink bg-surface">
              Don't have an account?{' '}
              <Link to="/register" className="text-ink hover:text-cyan underline decoration-2 underline-offset-4 transition-colors">
                Create one
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
