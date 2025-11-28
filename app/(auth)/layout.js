import { FooterMinimal } from '@/components/layout/Footer';

// ============================================
// AUTH LAYOUT
// Minimal layout for authentication pages
// ============================================

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <FooterMinimal />
    </div>
  );
}
