import '../styles/globals.css';
import { Roboto_Mono } from 'next/font/google';
import { Toaster } from 'sonner';

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata = {
  title: 'GEO Visibility',
  description: 'Track how your brand is perceived by AI models',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={robotoMono.variable}>
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
