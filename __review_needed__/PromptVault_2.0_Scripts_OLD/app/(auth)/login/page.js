'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Github, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Badge';
import { useAuth } from '@/components/Providers';
import toast from 'react-hot-toast';

// ============================================
// LOGIN PAGE
// ============================================

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithOAuth } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      router.push(redirectTo);
    } catch (error) {
      console.error('Login error:', error);
      if (error.message.includes('Invalid login')) {
        setErrors({ form: 'Invalid email or password' });
      } else {
        setErrors({ form: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      console.error('OAuth error:', error);
      toast.error('Failed to sign in with ' + provider);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900 dark:text-white">
              PromptVault
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign in to your account to continue
          </p>
        </div>

        <Card>
          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <Button
              variant="secondary"
              className="w-full"
              leftIcon={<Chrome className="w-5 h-5" />}
              onClick={() => handleOAuth('google')}
            >
              Continue with Google
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              leftIcon={<Github className="w-5 h-5" />}
              onClick={() => handleOAuth('github')}
            >
              Continue with GitHub
            </Button>
          </div>

          <Divider label="or continue with email" className="mb-6" />

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
                {errors.form}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              required
              leftIcon={<Mail className="w-5 h-5" />}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                error={errors.password}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
