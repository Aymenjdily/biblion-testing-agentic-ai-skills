import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Bitter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Biblion",
  description: "Find the exact second — search across every course, lesson and video moment.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${bitter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-ink-900">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}