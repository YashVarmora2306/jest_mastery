import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

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
        <div style={{ display: 'flex', minHeight: '100vh', paddingTop: '64px' }}>
          <Navigation />
          <main style={{ 
            flex: 1, 
            overflowY: 'auto', 
            height: 'calc(100vh - 64px)',
            marginLeft: '280px' // Offset for fixed sidebar on desktop
          }}>
            {children}
          </main>
        </div>
        <style>{`
          @media (max-width: 1024px) {
            main {
              margin-left: 0 !important;
            }
          }
          @media (min-width: 2560px) {
            div[style*="padding-top"] {
              padding-top: 80px !important;
            }
            main {
              height: calc(100vh - 80px) !important;
              margin-left: 350px !important; /* Match sidebar width */
            }
          }
        `}</style>
      </body>
    </html>
  );
}
