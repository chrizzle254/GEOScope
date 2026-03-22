import { AppLayout } from '@/components/shared/AppLayout';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      <main className="p-8">
        <h1 className="mb-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Account
        </h1>
        {children}
      </main>
    </AppLayout>
  );
}
