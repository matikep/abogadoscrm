import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Providers from './providers'; // Import the new Providers component

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LexCase Manager', // Updated App Name
  description: 'CRM para gestión de casos de abogados', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">{/* Removed extra space */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers> {/* Wrap children with Providers */}
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
