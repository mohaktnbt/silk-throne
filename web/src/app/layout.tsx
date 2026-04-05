import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: {
    default: "The Silk Throne — An Epic Interactive Fiction Game",
    template: "%s | The Silk Throne",
  },
  description:
    "A 300,000-word epic of power, betrayal, and empire. Shape the fate of the Khazaran Empire through your choices. Play the free preview now.",
  keywords: [
    "interactive fiction",
    "choice game",
    "text adventure",
    "Mughal",
    "Ottoman",
    "empire",
    "visual novel",
    "choose your own adventure",
    "text based game",
  ],
  openGraph: {
    title: "The Silk Throne",
    description: "A 300,000-word epic of power, betrayal, and empire. Your choices shape history.",
    type: "website",
    siteName: "The Silk Throne",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Silk Throne",
    description: "A 300,000-word epic of power, betrayal, and empire.",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router root layout is equivalent to _document.js */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('silk-throne-theme');if(t==='light'||t==='dark'){document.documentElement.className=t}else{document.documentElement.className='dark'}}catch(e){document.documentElement.className='dark'}})()`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-background focus:outline-none"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main id="main-content" className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
