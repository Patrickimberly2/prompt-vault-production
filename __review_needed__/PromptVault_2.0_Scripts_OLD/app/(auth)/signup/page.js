'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Mail, User, Github, Chrome, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput, Checkbox } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Badge';
import { useAuth } from '@/components/Providers';
import toast from 'react-hot-toast';

// ============================================
// SIGNUP PAGE
// ============================================

export default function SignupPage() {
  const router = useRouter();
  const { signUp, signInWithOAuth } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validatePassword = (pass) => {
    if (pass.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pass)) return 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(pass)) return 'Password must contain a number';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }

    if (!acceptTerms) {
      setErrors({ terms: 'Please accept the terms and conditions' });
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, { full_name: name });
      setSuccess(true);
    } catch (error) {
      console.error('Signup error:', error);
      if (error.message.includes('already registered')) {
        setErrors({ email: 'This email is already registered' });
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
      toast.error('Failed to sign up with ' + provider);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Check your email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We've sent a confirmation link to <strong>{email}</strong>. 
            Click the link to activate your account.
          </p>
          <Link href="/login">
            <Button variant="primary">Back to Login</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
            Create your account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Start exploring 20,000+ AI prompts for free
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

          <Divider label="or sign up with email" className="mb-6" />

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
                {errors.form}
              </div>
            )}

            <Input
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              error={errors.name}
              required
              leftIcon={<User className="w-5 h-5" />}
            />

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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                error={errors.password}
                required
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                At least 8 characters with uppercase and number
              </p>
            </div>

            <div>
              <Checkbox
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                label={
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    I agree to the{' '}
                    <Link href="/terms" className="text-brand-600 dark:text-brand-400 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-brand-600 dark:text-brand-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                }
              />
              {errors.terms && (
                <p className="mt-1 text-sm text-red-500">{errors.terms}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              loading={loading}
            >
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </Card>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-gray-500 dark:text-gray-400">
          <div>
            <div className="font-semibold text-gray-900 dark:text-white text-lg mb-1">20K+</div>
            Prompts
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white text-lg mb-1">Free</div>
            To start
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white text-lg mb-1">No CC</div>
            Required
          </div>
        </div>
      </motion.div>
    </div>
  );
}
