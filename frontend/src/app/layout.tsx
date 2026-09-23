import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "FinanceTracker",
  description: "Personal finance tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinanceTracker",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="financetracker" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-base-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
