import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { UserSynchronizer } from "@/components/UserSynchronizer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Socially - Connect and Share",
  description: "A social media platform to connect with friends and share your thoughts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <UserSynchronizer />
            {children}
            <ToastProvider />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
