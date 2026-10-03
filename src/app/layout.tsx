import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Archivo, Archivo_Black, Permanent_Marker, Space_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const marker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marker",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "COMIC WEEK — Festival Komik Tahunan Indonesia",
    template: "%s — COMIC WEEK",
  },
  description:
    "Festival komik tahunan terbesar di Indonesia. Baca komik orisinal Comic Week panel demi panel, buka chapter dengan Koin Tinta, dan temui kreatornya setiap November di Jakarta.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${archivo.variable} ${archivoBlack.variable} ${spaceMono.variable} ${marker.variable}`}>
      <body className="noise bg-ink font-sans text-paper antialiased">{children}</body>
    </html>
  );
}
