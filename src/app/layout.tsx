import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'MabarKuy - Platform Main Bareng Streamer Indonesia 🎮',
  description: 'Platform manajemen antrian mabar untuk streamer gamer Indonesia. Kelola antrian, pembayaran, dan buat pengalaman viewers jadi super kece!',
  keywords: ['streamer', 'gaming', 'indonesia', 'mabar', 'mobile legends', 'obs', 'streaming', 'main bareng'],
  authors: [{ name: 'MabarKuy Team' }],
  openGraph: {
    title: 'MabarKuy - Platform Main Bareng Streamer Indonesia',
    description: 'Platform manajemen antrian mabar untuk streamer gamer Indonesia',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Fredoka:wght@300;400;500;600;700&family=Patrick+Hand&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-body">
        <Providers>
        {children}
        </Providers>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              border: '3px solid var(--accent-purple)',
              borderRadius: '20px',
              boxShadow: '6px 6px 0 var(--accent-purple)',
              fontFamily: 'Fredoka, sans-serif',
              color: 'var(--text-primary)',
            },
          }}
        />
      </body>
    </html>
  );
}
