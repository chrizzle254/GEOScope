create table public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  reporting_subject_id uuid references public.reporting_subject(id),
  status text check (status in ('pending','running','completed','failed')),
  started_at timestamptz,
  completed_at timestamptz
);

alter table public.analysis_runs enable row level security;

create policy "Members can view their organization's analysis runs"
  on public.analysis_runs for select
  using (
    reporting_subject_id in (
      select id from public.reporting_subject where organization_id in (
        select organization_id from public.organization_members where user_id = auth.uid()
      )
    )
  );

create policy "Owners/admins can manage their organization's analysis runs"
  on public.analysis_runs for insert, update, delete
  using (
    reporting_subject_id in (
      select id from public.reporting_subject where organization_id in (
        select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')
      )
    )
  );

