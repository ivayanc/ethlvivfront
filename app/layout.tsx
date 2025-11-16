import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Degen Duels",
  description: "Predict cryptocurrency prices and challenge players!",
  other: {
    'fc:miniapp': JSON.stringify({
      version: 'next',
      imageUrl: 'https://ethlvivfront.vercel.app/logo.png',
      button: {
        title: 'Play Now',
        action: {
          type: 'launch_miniapp',
          name: 'Degen Duels',
          url: 'https://ethlvivfront.vercel.app'
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
