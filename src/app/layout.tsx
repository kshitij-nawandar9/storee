import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Storee - Bag Packs & Pouches",
  description: "Storee - Quality Bag Packs & Pouches for Every Need",
  icons: { icon: "/images/logo/logo.jpeg", apple: "/images/logo/logo.jpeg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
