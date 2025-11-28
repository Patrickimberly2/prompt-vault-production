'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Command,
  User,
  LogOut,
  Settings,
  BookOpen,
  Sparkles,
  Trophy,
  Bot,
  Link2,
  ChevronDown,
} from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { useTheme } from '@/components/Providers';
import { useAuth } from '@/components/Providers';

// ============================================
// NAVBAR COMPONENT
// ============================================

const navigation = [
  { name: 'Prompts', href: '/prompts', icon: Sparkles },
  { name: 'Bot Builder', href: '/bot-builder', icon: Bot },
  { name: 'Challenges', href: '/challenges', icon: Trophy },
  { name: 'Learn', href: '/learn', icon: BookOpen },
  { name: 'Chains', href: '/chains', icon: Link2 },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, signOut } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={clsx(
        'sticky top-0 z-40 w-full',
        'transition-all duration-200',
        scrolled
          ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800'
          : 'bg-transparent'
      )}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              PromptVault
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search trigger (opens command palette) */}
            <button
              onClick={() => {
                // Trigger command palette with custom event
                window.dispatchEvent(new CustomEvent('open-command-palette'));
              }}
              className={clsx(
                'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg',
                'bg-gray-100 dark:bg-gray-800',
                'text-gray-500 dark:text-gray-400',
                'hover:bg-gray-200 dark:hover:bg-gray-700',
                'transition-colors text-sm'
              )}
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs font-mono">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>

            {/* Theme toggle */}
            <ThemeToggle theme={theme} setTheme={setTheme} resolvedTheme={resolvedTheme} />

            {/* Auth buttons */}
            {user ? (
              <UserMenu user={user} signOut={signOut} />
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <IconButton
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </IconButton>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1 border-t border-gray-200 dark:border-gray-800">
                {navigation.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}

                {!user && (
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    <Link href="/login" className="block">
                      <Button variant="secondary" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup" className="block">
                      <Button variant="primary" className="w-full">
                        Sign up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

// ============================================
// THEME TOGGLE
// ============================================

function ThemeToggle({ theme, setTheme, resolvedTheme }) {
  const [open, setOpen] = useState(false);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="relative">
      <IconButton
        variant="ghost"
        onClick={() => setOpen(!open)}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </IconButton>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className={clsx(
                'absolute right-0 top-full mt-2 z-50',
                'w-36 p-1 rounded-lg',
                'bg-white dark:bg-gray-900',
                'border border-gray-200 dark:border-gray-800',
                'shadow-lg'
              )}
            >
              {themes.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => {
                      setTheme(t.value);
                      setOpen(false);
                    }}
                    className={clsx(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm',
                      'transition-colors',
                      theme === t.value
                        ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// USER MENU
// ============================================

function UserMenu({ user, signOut }) {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: User },
    { label: 'Favorites', href: '/favorites', icon: Sparkles },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'flex items-center gap-2 px-2 py-1.5 rounded-lg',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'transition-colors'
        )}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-medium text-sm">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className={clsx(
                'absolute right-0 top-full mt-2 z-50',
                'w-56 p-1 rounded-lg',
                'bg-white dark:bg-gray-900',
                'border border-gray-200 dark:border-gray-800',
                'shadow-lg'
              )}
            >
              {/* User info */}
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={clsx(
                        'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
                        'text-gray-700 dark:text-gray-300',
                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                        'transition-colors'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Sign out */}
              <div className="pt-1 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className={clsx(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm',
                    'text-red-600 dark:text-red-400',
                    'hover:bg-red-50 dark:hover:bg-red-950',
                    'transition-colors'
                  )}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
