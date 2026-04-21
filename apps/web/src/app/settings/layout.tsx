import { AppLayout } from '@/components/shared/AppLayout';
import { SettingsNav } from '@/components/shared/SettingsNav';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      <main className="flex flex-col gap-0 p-8">
        <h1 className="mb-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Config
        </h1>
        <SettingsNav />
        <div className="pt-8">{children}</div>
      </main>
    </AppLayout>
  );
}
