create table public.mentions (
  id uuid primary key default gen_random_uuid(),
  analysis_run_id uuid references public.analysis_runs(id),
  reporting_subject_id uuid references public.reporting_subject(id),
  provider_id text,
  sentiment text check (sentiment in ('positive','neutral','negative')),
  accurate boolean,
  excerpt text
);

alter table public.mentions enable row level security;

create policy "Members can view their organization's mentions"
  on public.mentions for select
  using (
    analysis_run_id in (
      select id from public.analysis_runs where reporting_subject_id in (
        select id from public.reporting_subject where organization_id in (
          select organization_id from public.organization_members where user_id = auth.uid()
        )
      )
    )
  );

create policy "Owners/admins can manage their organization's mentions"
  on public.mentions for insert, update, delete
  using (
    analysis_run_id in (
      select id from public.analysis_runs where reporting_subject_id in (
        select id from public.reporting_subject where organization_id in (
          select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')
        )
      )
    )
  );

