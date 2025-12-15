create table public.reporting_subject_metrics (
  analysis_run_id uuid references public.analysis_runs(id),
  reporting_subject_visibility_score numeric,
  accuracy_rate numeric,
  sentiment_score numeric,
  primary key (analysis_run_id)
);

alter table public.reporting_subject_metrics enable row level security;

create policy "Members can view their organization's metrics"
  on public.reporting_subject_metrics for select
  using (
    analysis_run_id in (
      select id from public.analysis_runs where reporting_subject_id in (
        select id from public.reporting_subject where organization_id in (
          select organization_id from public.organization_members where user_id = auth.uid()
        )
      )
    )
  );

create policy "Owners/admins can manage their organization's metrics"
  on public.reporting_subject_metrics for insert, update, delete
  using (
    analysis_run_id in (
      select id from public.analysis_runs where reporting_subject_id in (
        select id from public.reporting_subject where organization_id in (
          select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')
        )
      )
    )
  );

