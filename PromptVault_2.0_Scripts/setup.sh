#!/bin/bash

# ============================================
# PromptVault 2.0 Project Setup Script
# ============================================
# This script creates the complete folder structure
# and installs all required dependencies
# ============================================

echo "🚀 Setting up PromptVault 2.0..."

# Create directory structure
echo "📁 Creating directory structure..."

# App routes
mkdir -p app/\(auth\)/login
mkdir -p app/\(auth\)/signup
mkdir -p app/\(auth\)/forgot-password
mkdir -p app/\(dashboard\)/dashboard
mkdir -p app/\(dashboard\)/favorites
mkdir -p app/\(dashboard\)/collections
mkdir -p app/\(dashboard\)/settings
mkdir -p app/prompts/\[id\]
mkdir -p app/categories/\[slug\]
mkdir -p app/tags/\[slug\]
mkdir -p app/bot-builder/tutorials/\[slug\]
mkdir -p app/bot-builder/personas/create
mkdir -p app/bot-builder/personas/\[id\]
mkdir -p app/bot-builder/agents/create
mkdir -p app/bot-builder/agents/\[id\]
mkdir -p app/challenges/\[id\]
mkdir -p app/challenges/submit/\[id\]
mkdir -p app/learn/courses/\[slug\]
mkdir -p app/learn/lessons/\[id\]
mkdir -p app/learn/guides/\[slug\]
mkdir -p app/chains/create
mkdir -p app/chains/\[id\]
mkdir -p app/pricing
mkdir -p app/api/prompts
mkdir -p app/api/search
mkdir -p app/api/auth/callback
mkdir -p app/api/webhooks/stripe

# Components
mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/prompts
mkdir -p components/search
mkdir -p components/bot-builder
mkdir -p components/challenges
mkdir -p components/education
mkdir -p components/chains

# Lib and utilities
mkdir -p lib
mkdir -p hooks
mkdir -p styles
mkdir -p context
mkdir -p utils

# Supabase
mkdir -p supabase/migrations

# Public assets
mkdir -p public/icons
mkdir -p public/images

echo "✅ Directory structure created!"

# Install dependencies
echo "📦 Installing dependencies..."

npm install @supabase/supabase-js@latest
npm install @supabase/auth-helpers-nextjs@latest
npm install framer-motion@latest
npm install lucide-react@latest
npm install clsx@latest
npm install tailwind-merge@latest
npm install @radix-ui/react-dialog@latest
npm install @radix-ui/react-dropdown-menu@latest
npm install @radix-ui/react-toast@latest
npm install @radix-ui/react-tooltip@latest
npm install @radix-ui/react-tabs@latest
npm install @radix-ui/react-select@latest
npm install @radix-ui/react-switch@latest
npm install @radix-ui/react-slot@latest
npm install react-hot-toast@latest
npm install zustand@latest
npm install cmdk@latest
npm install date-fns@latest

# Dev dependencies
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

# Initialize Tailwind
npx tailwindcss init -p

echo "✅ Dependencies installed!"

echo ""
echo "🎉 PromptVault 2.0 setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy the generated files to your project"
echo "2. Update your .env.local with Supabase credentials"
echo "3. Run the database migrations"
echo "4. Start the dev server: npm run dev"
