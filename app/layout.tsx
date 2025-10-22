import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Emergency Supply Manager',
  description: 'Emergency preparedness and supply management system for PC, mobile, and tablet',
  generator: 'Next.js',
  keywords: ['emergency', 'preparedness', 'supplies', 'food storage', 'emergency kit'],
  authors: [{ name: 'Emergency Supply Manager Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Emergency Supply Manager',
  },
  openGraph: {
    title: 'Emergency Supply Manager',
    description: 'Emergency preparedness and supply management system',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Emergency Supply Manager',
    description: 'Emergency preparedness and supply management system',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e40af',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
