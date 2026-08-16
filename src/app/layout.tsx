import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Luncho - Meal Planning Web Application',
  description: 'Drag & Drop Meal Calendar System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f8f9fa] text-gray-900 min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1 flex overflow-hidden">{children}</main>
      </body>
    </html>
  );
}