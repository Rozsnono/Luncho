import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import ThemeProvider from '@/components/ThemeProvider';
import { getWorkSchedule } from '@/actions/scheduleActions';

export const metadata: Metadata = {
  title: 'Luncho - Meal Planning & Work Schedule',
  description: 'Drag & Drop Meal Calendar with Work Shift Planning',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schedule = await getWorkSchedule();

  return (
    <html lang="en" className="dark">
      <body className="bg-[#fafafa] dark:bg-[#0e0e10] text-gray-900 dark:text-zinc-100 min-h-screen flex flex-col antialiased transition-colors duration-200">
        <ThemeProvider>
          <Header initialSchedule={schedule} />
          <main className="flex-1 flex overflow-hidden">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}