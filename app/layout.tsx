import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Monopoly — Local Multiplayer Board Game',
  description:
    'A fully playable local multiplayer Monopoly game with dice, property trading, auctions, jail, and Chance & Community Chest cards.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.__v0err=[];window.addEventListener('error',function(e){window.__v0err.push(String((e.error&&e.error.stack)||e.message))});var _ce=console.error;console.error=function(){try{window.__v0err.push('CE:'+Array.from(arguments).map(function(a){return (a&&a.stack)||String(a)}).join(' '))}catch(x){}return _ce.apply(console,arguments)};",
          }}
        />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
