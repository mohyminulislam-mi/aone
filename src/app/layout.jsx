import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MobilStore - Premium Engine Oils & Lubricants",
  description:
    "Shop premium engine oils, lubricants, and vehicle care products. Designed with immaculate engineering for excellent performance.",
  openGraph: {
    title: "MobilStore - Premium Engine Oils & Lubricants",
    description:
      "Shop premium engine oils, lubricants, and vehicle care products.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
