import "@/styles/globals.css";
import { Inter } from "next/font/google";
import Providers from './providers';
import { AuthGuard } from '@/components/auth/AuthGuard';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Web3 Swarm",
  description: "Your AI-powered Web3 companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-white min-h-screen`}>
        <Providers>
          <AuthGuard>{children}</AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
