import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AxiosError } from 'axios';
import AuthForm from '../components/auth/AuthForm';
import HeroMascot from '../components/ui/HeroMascot';
import useAuthStore from '../store/useAuthStore';
import useToast from '../store/useToast';
import { AuthFormData } from '../types';
import authService from '../services/authService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  const handleLogin = async (
    formData: AuthFormData,
    setAuthError: (error: string) => void
  ) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      login(
        {
          id: response.id || response._id || '',
          name: response.name,
          email: response.email,
          token: response.token,
          createdAt: response.createdAt || new Date().toISOString(),
        },
        response.token
      );

      showToast(`Welcome back, ${response.name}!`, 'success');
      navigate(fromPath, { replace: true });
    } catch (err: unknown) {
      console.error('Login error:', err);
      if (err instanceof AxiosError && err.response?.data?.message) {
        setAuthError(err.response.data.message);
      } else {
        setAuthError('Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-16 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left Side: Illustration & Value Prop */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center md:items-start text-center md:text-left p-4 sm:p-8"
        >
          <div className="mb-6 flex justify-center md:justify-start">
            <HeroMascot />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Stay on Top of Your Tasks
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 max-w-md leading-relaxed font-normal">
            Organize tasks, track deadlines, and stay ahead every semester with IskoTasks.
          </p>
        </motion.div>

        {/* Right Side: Login Form Card */}
        <div className="w-full">
          <AuthForm
            type="login"
            onSubmit={handleLogin}
            onToggleForm={() => navigate('/signup')}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
