import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lar Control - Gestão de Contas',
  description: 'Lar Control - Gestão de Contas',
  viewport: 'width=device-width, initial-scale=1',
  manifest: '/manifest.json',
  publisher: 'Lar Control',
  creator: 'Lar Control',
  applicationName: 'Lar Control',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
    
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
