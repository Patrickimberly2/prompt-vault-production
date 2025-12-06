import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: {
    default: 'PromptVault - AI Prompt Library',
    template: '%s | PromptVault',
  },
  description: 'Your comprehensive AI prompt library with 20,000+ prompts, bot builder, challenges, and courses. Master prompt engineering with PromptVault.',
  keywords: [
    'AI prompts',
    'ChatGPT prompts', 
    'Claude prompts',
    'prompt engineering',
    'AI tools',
    'prompt library',
    'custom GPT',
    'AI personas',
  ],
  authors: [{ name: 'PromptVault' }],
  creator: 'PromptVault',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://promptvault.com',
    siteName: 'PromptVault',
    title: 'PromptVault - AI Prompt Library',
    description: 'Your comprehensive AI prompt library with 20,000+ prompts, bot builder, challenges, and courses.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PromptVault',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromptVault - AI Prompt Library',
    description: 'Your comprehensive AI prompt library with 20,000+ prompts.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-950 antialiased">
        <Providers>
          {/* Command Palette (Cmd+K) */}
          <CommandPalette />
          
          {/* Toast Notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-primary)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
          
          {/* Main Layout */}
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
