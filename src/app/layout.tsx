import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Jest Mastery - Interactive Guide',
  description: 'Learn Jest testing for Next.js with interactive examples.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ flex: 1, overflowY: 'auto', height: '100vh' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
