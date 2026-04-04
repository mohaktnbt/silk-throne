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
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
