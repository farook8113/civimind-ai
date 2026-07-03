import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata = {
  title: "CiviMind AI - UAE Legal & Government Assistant",
  description: "Advanced AI assistant for UAE law consulting, tenancy disputes, labour regulations (MOHRE), residency visas (Golden Visa), and legal document summaries.",
  metadataBase: new URL("https://civimind.ae"),
  openGraph: {
    title: "CiviMind AI - UAE Legal & Government Assistant",
    description: "Navigate UAE regulations, labour laws, and business setup with official authorities citations using AI.",
    images: []
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts integration */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Kufi+Arabic:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
