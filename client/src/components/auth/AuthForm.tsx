import React, { useState } from 'react';
import { User, Mail, Lock, EyeOff, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthFormData } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

interface AuthFormProps {
  type: 'login' | 'signup';
  onSubmit: (data: AuthFormData, setAuthError: (error: string) => void) => void;
  onToggleForm: () => void;
  isLoading?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  type,
  onSubmit,
  onToggleForm,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<AuthFormData>({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (authError) setAuthError('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (type === 'signup' && !formData.name?.trim()) {
      newErrors.name = 'Please enter your full name.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (type === 'signup') {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setAuthError('');
      onSubmit(formData, setAuthError);
    }
  };

  return (
    <Card variant="glass" className="w-full max-w-md p-6 sm:p-8 mx-auto shadow-2xl">
      <motion.div
        key={type}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full"
      >
        <h2 className="text-2xl sm:text-3xl font-black text-center text-slate-900 dark:text-white mb-2 tracking-tight">
          {type === 'login' ? 'Welcome Back!' : 'Create an Account'}
        </h2>
        <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-6">
          {type === 'login'
            ? 'Log in to manage your tasks and schedule.'
            : 'Sign up to organize your tasks and stay on top of deadlines.'}
        </p>

        {authError && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5"
          >
            <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
            <p className="flex-1 font-medium text-xs sm:text-sm">{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {type === 'signup' && (
            <Input
              name="name"
              label="Full name"
              placeholder="e.g. Juan dela Cruz"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              error={errors.name}
              icon={<User size={18} />}
              autoComplete="name"
              required
            />
          )}

          <Input
            name="email"
            type="email"
            label="Email address"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            error={errors.email}
            icon={<Mail size={18} />}
            autoComplete="email"
            required
          />

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              error={errors.password}
              helperText={type === 'signup' ? 'Use at least 8 characters.' : undefined}
              icon={<Lock size={18} />}
              autoComplete={type === 'login' ? 'current-password' : 'new-password'}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-3.5 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="mt-6"
            icon={<ArrowRight size={18} />}
          >
            {type === 'login' ? 'Sign In' : 'Get Started'}
          </Button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {type === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={onToggleForm}
              className="ml-2 font-bold text-sky-600 dark:text-sky-400 hover:underline focus:outline-none"
            >
              {type === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </motion.div>
    </Card>
  );
};

export default AuthForm;
