import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "OTTO-IMUNE",
  description: "Questionário de Elegibilidade para uso de Imunobiológicos na Rinossinusite Crônica com Polipose Nasossinusal"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d6d6d"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${interFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
