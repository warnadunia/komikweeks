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
    default: "KomikWeeks — Yogyakarta Komik Weeks",
    template: "%s — KomikWeeks",
  },
  description:
    "KomikWeeks — Yogyakarta Komik Weeks. Festival komik tahunan, baca komik orisinal vertikal, artshop merchandise resmi, dan temui kreatornya.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${archivo.variable} ${archivoBlack.variable} ${spaceMono.variable} ${marker.variable}`}>
      <body className="noise bg-ink font-sans text-paper antialiased">{children}</body>
    </html>
  );
}
