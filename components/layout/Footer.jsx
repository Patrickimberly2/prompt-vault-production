'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { 
  Sparkles, 
  Twitter, 
  Github, 
  Youtube,
  Mail,
  Heart
} from 'lucide-react';

// ============================================
// FOOTER COMPONENT
// ============================================

const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { name: 'Prompts', href: '/prompts' },
      { name: 'Bot Builder', href: '/bot-builder' },
      { name: 'Challenges', href: '/challenges' },
      { name: 'Learn', href: '/learn' },
      { name: 'Pricing', href: '/pricing' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs' },
      { name: 'Guides', href: '/learn/guides' },
      { name: 'Blog', href: '/blog' },
      { name: 'Changelog', href: '/changelog' },
      { name: 'API', href: '/api-docs' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Licenses', href: '/licenses' },
    ],
  },
};

const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com/promptvault', icon: Twitter },
  { name: 'GitHub', href: 'https://github.com/promptvault', icon: Github },
  { name: 'YouTube', href: 'https://youtube.com/@promptvault', icon: Youtube },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Main footer content */}
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                PromptVault
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-xs">
              Your comprehensive AI prompt library with 20,000+ prompts. 
              Master prompt engineering and build custom AI assistants.
            </p>

            {/* Newsletter signup */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Stay updated
              </h4>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={clsx(
                    'flex-1 px-3 py-2 rounded-lg text-sm',
                    'bg-white dark:bg-gray-800',
                    'border border-gray-300 dark:border-gray-700',
                    'placeholder:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500'
                  )}
                />
                <button
                  type="submit"
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    'bg-brand-600 text-white',
                    'hover:bg-brand-700',
                    'transition-colors'
                  )}
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="container-custom py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} PromptVault. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for the AI community
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MINIMAL FOOTER (for auth pages, etc.)
// ============================================

export function FooterMinimal() {
  return (
    <footer className="py-6 border-t border-gray-200 dark:border-gray-800">
      <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            PromptVault
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
