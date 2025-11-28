export const metadata = {
  title: 'PromptVault - AI Prompt Library',
  description: 'Your comprehensive AI prompt organizer with 20,000+ prompts from Notion collections',
  keywords: ['AI prompts', 'ChatGPT', 'prompt library', 'AI tools'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
