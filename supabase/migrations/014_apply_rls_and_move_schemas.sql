-- 1. Create Schemas
create schema if not exists internal;
create schema if not exists billing;

-- 2. Move Tables to Correct Schemas
alter table public.llm_providers set schema internal;
alter table public.prompts set schema internal;
alter table public.llm_responses set schema internal;
alter table public.customers set schema billing;
alter table public.subscriptions set schema billing;

-- 3. Enable RLS and Apply Policies

-- public.organizations
alter table public.organizations enable row level security;
create policy "Authenticated users can create organizations" on public.organizations for insert with check (auth.role() = 'authenticated');
create policy "Members can view their organization" on public.organizations for select using (id in (select organization_id from public.organization_members where user_id = auth.uid()));
create policy "Owners/admins can update their organization" on public.organizations for update using (id in (select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')));
create policy "Owners can delete their organization" on public.organizations for delete using (id in (select organization_id from public.organization_members where user_id = auth.uid() and role = 'owner'));

-- public.organization_members
alter table public.organization_members enable row level security;
create policy "Members can view other members" on public.organization_members for select using (organization_id in (select organization_id from public.organization_members where user_id = auth.uid()));
create policy "Owners/admins can manage members" on public.organization_members for all using (organization_id in (select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- Other public tables (reporting_subject, competitors, analysis_runs, mentions, metrics)
alter table public.reporting_subject enable row level security;
create policy "Members can view reporting subjects" on public.reporting_subject for select using (organization_id in (select organization_id from public.organization_members where user_id = auth.uid()));
create policy "Owners/admins can manage reporting subjects" on public.reporting_subject for all using (organization_id in (select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')));

alter table public.reporting_subject_competitors enable row level security;
create policy "Members can view competitors" on public.reporting_subject_competitors for select using (reporting_subject_id in (select id from public.reporting_subject where organization_id in (select organization_id from public.organization_members where user_id = auth.uid())));
create policy "Owners/admins can manage competitors" on public.reporting_subject_competitors for all using (reporting_subject_id in (select id from public.reporting_subject where organization_id in (select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin'))));

alter table public.analysis_runs enable row level security;
create policy "Members can view analysis runs" on public.analysis_runs for select using (reporting_subject_id in (select id from public.reporting_subject where organization_id in (select organization_id from public.organization_members where user_id = auth.uid())));
create policy "Owners/admins can manage analysis runs" on public.analysis_runs for all using (reporting_subject_id in (select id from public.reporting_subject where organization_id in (select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin'))));

alter table public.mentions enable row level security;
create policy "Members can view mentions" on public.mentions for select using (run_id in (select id from public.analysis_runs where reporting_subject_id in (select id from public.reporting_subject where organization_id in (select organization_id from public.organization_members where user_id = auth.uid()))));
create policy "Owners/admins can manage mentions" on public.mentions for all using (run_id in (select id from public.analysis_runs where reporting_subject_id in (select id from public.reporting_subject where organization_id in (select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')))));

alter table public.reporting_subject_metrics enable row level security;
create policy "Members can view metrics" on public.reporting_subject_metrics for select using (analysis_run_id in (select id from public.analysis_runs where reporting_subject_id in (select id from public.reporting_subject where organization_id in (select organization_id from public.organization_members where user_id = auth.uid()))));
create policy "Owners/admins can manage metrics" on public.reporting_subject_metrics for all using (analysis_run_id in (select id from public.analysis_runs where reporting_subject_id in (select id from public.reporting_subject where organization_id in (select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')))));

-- billing.customers
alter table billing.customers enable row level security;
create policy "Users can manage their own customer record" on billing.customers for all using (user_id = auth.uid());

-- billing.subscriptions
alter table billing.subscriptions enable row level security;
create policy "Owners/admins can manage subscriptions" on billing.subscriptions for all using (organization_id in (select organization_id from public.organization_members where user_id = auth.uid() and role in ('owner', 'admin')));
