import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from '@clerk/nextjs'

const IBMPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex"
});

export const metadata: Metadata = {
  title: "UXhibit",
  description: "AI-powered image generator",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#ed5e20'
        },
        layout: {
          logoImageUrl: '/logo.png',
        },
        elements: {
          logoBox: 'flex justify-center',
          logoImage: 'w-32 h-10 object-contain', // Set the height and weight
        }

      }}
    >
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );

}