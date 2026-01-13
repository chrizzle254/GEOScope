import '../styles/globals.css';

export const metadata = {
  title: 'Next.js Monorepo App Router',
  description: 'Basic setup for API and Supabase communication testing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
