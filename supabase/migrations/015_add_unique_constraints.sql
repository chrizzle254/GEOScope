-- Add unique constraint to organization name to prevent duplicate organizations.
ALTER TABLE public.organizations ADD CONSTRAINT organizations_name_key UNIQUE (name);

-- Add unique constraint to reporting_subject name per organization.
ALTER TABLE public.reporting_subject ADD CONSTRAINT reporting_subject_organization_id_name_key UNIQUE (organization_id, name);

-- Add unique constraint to competitor name per reporting_subject.
ALTER TABLE public.reporting_subject_competitors ADD CONSTRAINT reporting_subject_competitors_reporting_subject_id_name_key UNIQUE (reporting_subject_id, name);
