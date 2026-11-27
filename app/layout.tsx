import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Noto_Serif_SC, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AppPreferencesProvider } from '@/components/AppPreferencesProvider';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SITE_URL } from '@/lib/site';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans-ui',
  display: 'swap',
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif-editorial',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-data',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nirvaner · 紫微斗数 · 三纪',
  description: 'Hệ thống lập lá số Tử Vi Đẩu Số theo tinh thần Thiên Kỷ Nghê Hải Hạ, Hợp Bàn, Tiểu Lục Nhâm, Mệnh Lý Song Tử và Cổ Thư Nguyên Điển.',
  keywords: '紫微斗数, 倪海厦, Tử Vi Đẩu Số, Hợp Bàn, Tiểu Lục Nhâm, Thiên Kỷ, Địa Kỷ, Nhân Kỷ, Nirvaner',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Nirvaner · 紫微斗数 · 三纪',
    description: 'Hệ thống lập lá số Tử Vi Đẩu Số, Hợp Bàn, Tiểu Lục Nhâm, Mệnh Lý Song Tử và Cổ Thư Nguyên Điển.',
    url: SITE_URL,
    siteName: 'Nirvaner',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${notoSerifSC.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ziwei-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');document.documentElement.classList.add('dark');}else{document.documentElement.setAttribute('data-theme','light');document.documentElement.classList.remove('dark');}}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <AppPreferencesProvider>
            {children}
          </AppPreferencesProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
