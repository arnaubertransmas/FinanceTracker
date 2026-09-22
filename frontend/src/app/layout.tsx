import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "FinanceTracker",
  description: "Personal finance tracker",
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
