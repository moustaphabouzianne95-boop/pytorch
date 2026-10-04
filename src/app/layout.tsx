import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PyTorch — Interactive Platform | المنصة التفاعلية",
  description:
    "Bilingual (English / العربية) interactive explorer for PyTorch: framework features, guided lessons, an in-browser neural-network playground, a contributions dashboard, and a searchable API reference. منصة تفاعلية ثنائية اللغة لاستكشاف PyTorch: الميزات، مركز تعلّم، ملعب شبكات عصبية، لوحة مساهمات، ومرجع API.",
  keywords: [
    "PyTorch",
    "Deep Learning",
    "Machine Learning",
    "التعلم العميق",
    "تعلم الآلة",
    "الشبكات العصبية",
    "Autograd",
    "CUDA",
    "TorchScript",
  ],
  authors: [{ name: "Z.ai Code" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "PyTorch — Interactive Platform | المنصة التفاعلية",
    description:
      "Explore PyTorch in English & Arabic: features, guided learning, neural-network playground, contributions dashboard, and API reference.",
    siteName: "PyTorch Interactive",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} ${inter.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
