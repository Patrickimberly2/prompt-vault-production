'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  Search,
  Sparkles,
  Bot,
  Trophy,
  BookOpen,
  Link2,
  Settings,
  User,
  Home,
  FileText,
  Tag,
  Folder,
  Sun,
  Moon,
  LogOut,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '@/components/Providers';
import { useAuth } from '@/components/Providers';

// ============================================
// COMMAND PALETTE COMPONENT
// ============================================

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { user, signOut } = useAuth();

  // Toggle with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    // Listen for custom event from navbar search button
    const handleCustomOpen = () => setOpen(true);
    
    document.addEventListener('keydown', down);
    window.addEventListener('open-command-palette', handleCustomOpen);
    
    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, []);

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setTimeout(() => setSearch(''), 200);
    }
  }, [open]);

  const runCommand = useCallback((command) => {
    setOpen(false);
    command();
  }, []);

  // Navigation items
  const navigationItems = [
    { name: 'Home', icon: Home, href: '/', keywords: 'home main' },
    { name: 'Browse Prompts', icon: Sparkles, href: '/prompts', keywords: 'prompts browse search' },
    { name: 'Bot Builder', icon: Bot, href: '/bot-builder', keywords: 'bot builder personas agents' },
    { name: 'Challenges', icon: Trophy, href: '/challenges', keywords: 'challenges compete win' },
    { name: 'Learn', icon: BookOpen, href: '/learn', keywords: 'learn courses guides education' },
    { name: 'Prompt Chains', icon: Link2, href: '/chains', keywords: 'chains workflows sequences' },
  ];

  // Quick actions
  const quickActions = [
    { name: 'Create New Persona', icon: Plus, href: '/bot-builder/personas/create', keywords: 'create new persona' },
    { name: 'Start a Challenge', icon: Trophy, href: '/challenges', keywords: 'start challenge compete' },
    { name: 'Create Prompt Chain', icon: Link2, href: '/chains/create', keywords: 'create chain workflow' },
  ];

  // User items (when logged in)
  const userItems = user ? [
    { name: 'Dashboard', icon: User, href: '/dashboard', keywords: 'dashboard profile' },
    { name: 'My Favorites', icon: Sparkles, href: '/favorites', keywords: 'favorites bookmarks saved' },
    { name: 'My Collections', icon: Folder, href: '/collections', keywords: 'collections folders' },
    { name: 'Settings', icon: Settings, href: '/settings', keywords: 'settings preferences account' },
  ] : [];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Command dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
          >
            <Command
              className={clsx(
                'w-full max-w-xl rounded-xl overflow-hidden',
                'bg-white dark:bg-gray-900',
                'border border-gray-200 dark:border-gray-800',
                'shadow-2xl'
              )}
              loop
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800">
                <Search className="w-5 h-5 text-gray-400" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search prompts, navigate, or run commands..."
                  className={clsx(
                    'flex-1 py-4 text-base',
                    'bg-transparent border-none outline-none',
                    'text-gray-900 dark:text-white',
                    'placeholder:text-gray-400'
                  )}
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-gray-500">
                  No results found.
                </Command.Empty>

                {/* Navigation */}
                <Command.Group heading="Navigation" className="mb-2">
                  <GroupHeading>Navigation</GroupHeading>
                  {navigationItems.map((item) => (
                    <CommandItem
                      key={item.href}
                      icon={item.icon}
                      onSelect={() => runCommand(() => router.push(item.href))}
                      keywords={item.keywords}
                    >
                      {item.name}
                    </CommandItem>
                  ))}
                </Command.Group>

                {/* Quick Actions */}
                <Command.Group heading="Quick Actions" className="mb-2">
                  <GroupHeading>Quick Actions</GroupHeading>
                  {quickActions.map((item) => (
                    <CommandItem
                      key={item.href}
                      icon={item.icon}
                      onSelect={() => runCommand(() => router.push(item.href))}
                      keywords={item.keywords}
                    >
                      {item.name}
                    </CommandItem>
                  ))}
                </Command.Group>

                {/* User items */}
                {userItems.length > 0 && (
                  <Command.Group heading="Account" className="mb-2">
                    <GroupHeading>Account</GroupHeading>
                    {userItems.map((item) => (
                      <CommandItem
                        key={item.href}
                        icon={item.icon}
                        onSelect={() => runCommand(() => router.push(item.href))}
                        keywords={item.keywords}
                      >
                        {item.name}
                      </CommandItem>
                    ))}
                    <CommandItem
                      icon={LogOut}
                      onSelect={() => runCommand(() => signOut())}
                      keywords="sign out logout"
                      destructive
                    >
                      Sign Out
                    </CommandItem>
                  </Command.Group>
                )}

                {/* Theme */}
                <Command.Group heading="Theme">
                  <GroupHeading>Theme</GroupHeading>
                  <CommandItem
                    icon={Sun}
                    onSelect={() => runCommand(() => setTheme('light'))}
                    keywords="light theme mode"
                  >
                    Light Mode
                  </CommandItem>
                  <CommandItem
                    icon={Moon}
                    onSelect={() => runCommand(() => setTheme('dark'))}
                    keywords="dark theme mode"
                  >
                    Dark Mode
                  </CommandItem>
                </Command.Group>
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">↵</kbd>
                    select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">esc</kbd>
                  close
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function GroupHeading({ children }) {
  return (
    <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
      {children}
    </div>
  );
}

function CommandItem({ children, icon: Icon, onSelect, keywords, destructive }) {
  return (
    <Command.Item
      onSelect={onSelect}
      keywords={keywords?.split(' ')}
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
        'text-sm',
        'transition-colors',
        destructive
          ? 'text-red-600 dark:text-red-400 data-[selected=true]:bg-red-50 dark:data-[selected=true]:bg-red-950'
          : 'text-gray-700 dark:text-gray-300 data-[selected=true]:bg-gray-100 dark:data-[selected=true]:bg-gray-800'
      )}
    >
      {Icon && <Icon className="w-4 h-4 opacity-60" />}
      <span className="flex-1">{children}</span>
      <ArrowRight className="w-4 h-4 opacity-0 group-data-[selected=true]:opacity-60" />
    </Command.Item>
  );
}
