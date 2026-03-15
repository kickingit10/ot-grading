import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/lib/theme";
import { ToastProvider } from "@/lib/toast";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "OT Tracker", template: "%s | OT Tracker" },
  description: "Simple, intuitive occupational therapy student grading app",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "OT Tracker" },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('ot-theme') || 'default';
              var mode = localStorage.getItem('ot-color-mode') || 'light';
              var era = localStorage.getItem('ot-era') || 'lover';
              if (mode === 'system') {
                mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              document.documentElement.setAttribute('data-theme', theme);
              document.documentElement.setAttribute('data-mode', mode);
              if (theme === 'taylor-swift') {
                document.documentElement.setAttribute('data-era', era);
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
