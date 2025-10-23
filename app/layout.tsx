import type { Metadata } from "next";
import { Providers } from './providers';
import GoogleAnalytics from '../components/GoogleAnalytics';
import "./app.css";

export const metadata: Metadata = {
  title: "OculusCyber - Cybersecurity Knowledge Base",
  description: "Comprehensive cybersecurity resources, best practices, and tutorials for securing your infrastructure",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
