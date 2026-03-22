import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import JsonLd from '@/components/JsonLd';
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'KADI | Transmisiones Automotrices y Diferenciales con IA en México',
  description: 'Expertos en transmisiones automotrices con 15 años de experiencia. Cotiza con NIA, nuestra IA de soporte 24/7. Entrega en 24h a todo México. ¡Visítanos!',
  keywords: 'transmisiones automotrices, transmisiones para autos, diferenciales, reconstrucción de transmisiones, taller de transmisiones CDMX, transmisiones Toyota, transmisiones Nissan, NIA asesor IA',
  authors: [{ name: 'KADI TS&D' }],
  creator: 'KADI Transmission Systems',
  publisher: 'KADI TS&D',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kadi-smart.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KADI | Transmisiones Automotrices con IA',
    description: 'La primera asesoría de transmisiones con inteligencia artificial en México',
    url: 'https://kadi-smart.vercel.app',
    siteName: 'KADI TS&D',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KADI Transmission Systems - Asesoría con IA',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KADI | Transmisiones Automotrices con IA',
    description: 'La primera asesoría de transmisiones con inteligencia artificial en México',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'tu-codigo-de-verificacion',
  },
  category: 'automotive',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          {children}
          <JsonLd />
        </CartProvider>
      </body>
    </html>
  );
}