import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import QueryProvider from "@/utils/providers/QueryProvider";
import { Suspense } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const SITE_NAME = "Your Hardware Supply Co.";
const SITE_URL = "https://www.example.com";
const SITE_DESCRIPTION =
  "Your trusted hardware supplier for building materials, power and hand tools, plumbing, electrical, paints, fasteners and more. Quality products, competitive prices, and bulk orders for contractors and homeowners.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Building Materials, Tools & Hardware Supplies`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "hardware supplier",
    "hardware store",
    "building materials",
    "construction supplies",
    "power tools",
    "hand tools",
    "plumbing supplies",
    "electrical supplies",
    "paints and coatings",
    "nuts bolts and fasteners",
    "bulk hardware orders",
    "wholesale hardware",
  ],
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Building Materials, Tools & Hardware Supplies`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Building Materials, Tools & Hardware Supplies`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-poppins">
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </QueryProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}