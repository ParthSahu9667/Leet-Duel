import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gamified LeetCode Comparison",
  description: "A premium dashboard to compare LeetCode profiles via Power Score.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#020205] text-white`}>
        {children}
      </body>
    </html>
  );
}
