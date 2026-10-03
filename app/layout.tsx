import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Libre_Bodoni, Playfair_Display, Great_Vibes } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { SearchProvider } from "@/components/SearchProvider";
import { CartProvider } from "@/components/CartProvider";
import { ConfigProvider } from "@/components/ConfigProvider";
import { AuthProvider } from "@/components/AuthProvider";
import LunchBreakPopup from "@/components/LunchBreakPopup";

// import { getProducts } from "@/lib/products-server";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Cormorant_Garamond({ weight: ['400', '500', '600', '700'], subsets: ["latin"], variable: "--font-serif" });
const script = Great_Vibes({ weight: '400', subsets: ["latin"], variable: "--font-script" });
const elegant = Playfair_Display({ weight: ['400', '700'], subsets: ["latin"], variable: "--font-elegant" });
const bodoni = Libre_Bodoni({ weight: '400', subsets: ["latin"], variable: "--font-bodoni" });

export const metadata: Metadata = {
  metadataBase: new URL("https://magyarekszer.hu"),
  title: {
    default: "Magyar Ékszer",
    template: "%s | Magyar Ékszer"
  },
  description: "Kiváló minőségű, kézzel készült Szkíta, Hun és Magyar tradicionális ékszerek, talizmánok és viseletkiegészítők közvetlenül a műhelyből.",
  keywords: [
    "szkíta ékszerek", "hun ékszerek", "magyar ékszerek", "tradicionális ékszer", 
    "kézműves ékszer", "rekeszzománc", "talizmán", "hagyományőrző", "nemzeti ékszer",
    "ékszer öntés", "3D ékszertervezés", "egyedi eljegyzési gyűrű", "pecsétgyűrű készítés", 
    "arany ékszer készítés", "eljegyzési gyűrű pár", "karikagyűrű készítés", "ékszer javítás"
  ],
  authors: [{ name: "Magyar Ékszer" }],
  creator: "Magyar Ékszer",
  publisher: "Magyar Ékszer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Magyar Ékszer | Szkíta-Hun-Magyar Tradicionális Ékszerek",
    description: "Kiváló minőségű, kézzel készült Szkíta, Hun és Magyar tradicionális ékszerek, talizmánok és viseletkiegészítők.",
    url: "https://magyarekszer.hu",
    siteName: "Magyar Ékszer",
    locale: "hu_HU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Magyar Ékszer | Szkíta-Hun-Magyar Tradicionális Ékszerek",
    description: "Kiváló minőségű, kézzel készült Szkíta, Hun és Magyar tradicionális ékszerek.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const initialProducts = getProducts();

  return (
    <html lang="hu">
      <body className={`${inter.variable} ${serif.variable} ${script.variable} ${elegant.variable} ${bodoni.variable} font-sans antialiased text-ivory bg-deep-brown`}>
        <ConfigProvider>
          <AuthProvider>
            <CartProvider>
              <SearchProvider>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-grow pt-28">
                    {children}
                  </main>
                  <Footer />
                  <LunchBreakPopup />
                  <CookieConsent />
                </div>
              </SearchProvider>
            </CartProvider>
          </AuthProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
