import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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

export const metadata: Metadata = {
  title: "PyTorch — المنصة التفاعلية | ميزات، تعلّم، ملعب شبكات عصبية",
  description:
    "منصة تفاعلية عربية لاستكشاف PyTorch: ميزات الإطار وحالات استخدامه ونظامه البيئي، مركز تعلّم تفاعلي، ملعب شبكات عصبية يعمل في المتصفح، لوحة بيانات المساهمات، ومرجع API قابل للبحث.",
  keywords: [
    "PyTorch",
    "تعلم الآلة",
    "الشبكات العصبية",
    "Deep Learning",
    "Autograd",
    "CUDA",
    "TorchScript",
  ],
  authors: [{ name: "Z.ai Code" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "PyTorch — المنصة التفاعلية",
    description: "استكشف PyTorch: ميزات، تعلّم تفاعلي، ملعب شبكات عصبية، لوحة مساهمات، ومرجع API.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
