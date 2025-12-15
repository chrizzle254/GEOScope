create table public.reporting_subjectcompetitors (
  id uuid primary key default gen_random_uuid(),
  reporting_subject_id uuid references public.reporting_subject(id),
  name text not null
);

alter table public.reporting_subjectcompetitors enable row level security;

create policy "Members can view their organization's reporting subject competitors"
  on public.reporting_subjectcompetitors for select
  using (
    reporting_subject_id in (
      select id from public.reporting_subject where organization_id in (
        select organization_id from public.organization_members where user_id = auth.uid()
      )
    )
  );

create policy "Owners/admins can manage their organization's reporting subject competitors"
  on public.reporting_subjectcompetitors for insert, update, delete
  using (
    reporting_subject_id in (
      select id from public.reporting_subject where organization_id in (
        select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')
      )
    )
  );

