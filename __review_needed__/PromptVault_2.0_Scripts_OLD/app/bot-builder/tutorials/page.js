import Link from 'next/link';
import {
  BookOpen,
  Play,
  Clock,
  ChevronRight,
  Star,
  CheckCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// ============================================
// BOT BUILDER TUTORIALS PAGE
// ============================================

export const metadata = {
  title: 'Bot Builder Tutorials',
  description: 'Step-by-step guides for creating custom AI bots on ChatGPT, Claude, Gemini, and more.',
};

// Tutorial data
const TUTORIALS = [
  {
    id: 'custom-gpt',
    title: 'Create a Custom GPT',
    platform: 'ChatGPT',
    platformColor: 'bg-green-500',
    difficulty: 'Beginner',
    duration: '10 min',
    description: 'Learn how to create your own Custom GPT with specific instructions, knowledge, and capabilities.',
    steps: [
      'Access GPT Builder in ChatGPT Plus',
      'Define your GPT\'s purpose and personality',
      'Add custom instructions and knowledge',
      'Configure capabilities and actions',
      'Test and publish your GPT',
    ],
    featured: true,
  },
  {
    id: 'claude-projects',
    title: 'Set Up Claude Projects',
    platform: 'Claude',
    platformColor: 'bg-orange-500',
    difficulty: 'Beginner',
    duration: '8 min',
    description: 'Create persistent workspaces in Claude with custom instructions and uploaded knowledge.',
    steps: [
      'Create a new Project in Claude',
      'Write custom instructions',
      'Upload relevant documents',
      'Configure project settings',
      'Start conversations in your project',
    ],
    featured: true,
  },
  {
    id: 'gemini-gems',
    title: 'Configure Gemini Gems',
    platform: 'Gemini',
    platformColor: 'bg-blue-500',
    difficulty: 'Beginner',
    duration: '7 min',
    description: 'Build custom AI experts called Gems in Google Gemini with specialized knowledge.',
    steps: [
      'Open Gem Manager in Gemini',
      'Create a new Gem',
      'Define instructions and expertise',
      'Add example conversations',
      'Save and use your Gem',
    ],
    featured: false,
  },
  {
    id: 'ollama-setup',
    title: 'Local LLM with Ollama',
    platform: 'Ollama',
    platformColor: 'bg-gray-700',
    difficulty: 'Intermediate',
    duration: '15 min',
    description: 'Run AI models locally on your computer with complete privacy using Ollama.',
    steps: [
      'Install Ollama on your system',
      'Download your first model',
      'Create a custom Modelfile',
      'Define system prompts and parameters',
      'Run and interact with your bot',
    ],
    featured: false,
  },
  {
    id: 'poe-bot',
    title: 'Build a Poe Bot',
    platform: 'Poe',
    platformColor: 'bg-purple-500',
    difficulty: 'Beginner',
    duration: '12 min',
    description: 'Create and share custom AI bots on Poe\'s platform with millions of users.',
    steps: [
      'Access Poe\'s bot creation interface',
      'Choose a base model',
      'Write your bot\'s prompt',
      'Configure settings and intro message',
      'Publish and share your bot',
    ],
    featured: false,
  },
  {
    id: 'character-ai',
    title: 'Create on Character.AI',
    platform: 'Character.AI',
    platformColor: 'bg-cyan-500',
    difficulty: 'Beginner',
    duration: '10 min',
    description: 'Build engaging AI characters with unique personalities for conversations.',
    steps: [
      'Start character creation',
      'Define personality and background',
      'Write character description',
      'Add example dialogues',
      'Test and publish your character',
    ],
    featured: false,
  },
  {
    id: 'openai-assistants',
    title: 'OpenAI Assistants API',
    platform: 'OpenAI API',
    platformColor: 'bg-emerald-600',
    difficulty: 'Advanced',
    duration: '25 min',
    description: 'Build powerful AI assistants with code interpreter, retrieval, and function calling.',
    steps: [
      'Set up your OpenAI API account',
      'Create an Assistant via API',
      'Configure tools and capabilities',
      'Upload files for retrieval',
      'Manage threads and messages',
    ],
    featured: false,
  },
  {
    id: 'huggingface-spaces',
    title: 'HuggingFace Spaces',
    platform: 'HuggingFace',
    platformColor: 'bg-yellow-500',
    difficulty: 'Intermediate',
    duration: '20 min',
    description: 'Deploy custom AI applications using Gradio or Streamlit on HuggingFace.',
    steps: [
      'Create a HuggingFace account',
      'Set up a new Space',
      'Choose Gradio or Streamlit',
      'Build your interface',
      'Deploy and share',
    ],
    featured: false,
  },
];

const DIFFICULTY_COLORS = {
  Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function TutorialsPage() {
  const featuredTutorials = TUTORIALS.filter((t) => t.featured);
  const allTutorials = TUTORIALS.filter((t) => !t.featured);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600">
        <div className="container-custom py-16">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
              <BookOpen className="w-4 h-4 mr-1" />
              Tutorials
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Bot Builder Tutorials
            </h1>
            <p className="text-lg text-white/80">
              Step-by-step guides to create custom AI assistants on every major platform.
              From beginner-friendly to advanced techniques.
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Featured Tutorials */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Featured Tutorials
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {featuredTutorials.map((tutorial) => (
              <Link key={tutorial.id} href={`/bot-builder/tutorials/${tutorial.id}`}>
                <Card hover className="h-full">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${tutorial.platformColor} flex items-center justify-center flex-shrink-0`}>
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" size="sm">
                          {tutorial.platform}
                        </Badge>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[tutorial.difficulty]}`}>
                          {tutorial.difficulty}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {tutorial.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {tutorial.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {tutorial.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {tutorial.steps.length} steps
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* All Tutorials */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            All Tutorials
          </h2>
          
          <div className="grid gap-4">
            {allTutorials.map((tutorial) => (
              <Link key={tutorial.id} href={`/bot-builder/tutorials/${tutorial.id}`}>
                <Card hover className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${tutorial.platformColor} flex items-center justify-center flex-shrink-0`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {tutorial.title}
                      </h3>
                      <Badge variant="secondary" size="sm">
                        {tutorial.platform}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                      {tutorial.description}
                    </p>
                  </div>
                  
                  <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                    <span className={`px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[tutorial.difficulty]}`}>
                      {tutorial.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {tutorial.duration}
                    </span>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16">
          <Card className="bg-gradient-to-br from-brand-500 to-accent-500 text-white text-center p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to build your own AI assistant?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              After following the tutorials, take it further by creating custom personas
              with unique personalities and expertise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/bot-builder/personas/create">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-brand-600 hover:bg-gray-100"
                >
                  Create a Persona
                </Button>
              </Link>
              <Link href="/bot-builder/personas">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  Browse Personas
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
