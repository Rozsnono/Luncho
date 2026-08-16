import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import ThemeProvider from '@/components/ThemeProvider';
import { getWorkSchedule } from '@/actions/scheduleActions';

export const metadata: Metadata = {
  title: 'Luncho - Meal Planning Web App',
  description: 'Drag & Drop Meal Calendar System',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schedule = await getWorkSchedule();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('luncho-theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#fafafa] dark:bg-[#0e0e10] text-gray-900 dark:text-zinc-100 min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <Header initialSchedule={schedule} />
          <main className="flex-1 flex flex-col min-h-0">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}