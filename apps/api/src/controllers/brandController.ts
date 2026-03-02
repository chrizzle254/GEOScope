import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export async function getBrands(req: Request, res: Response) {
  const organization_id = req.user!.organization_id;

  const { data: subjects, error } = await supabaseAdmin
    .from('reporting_subject')
    .select(
      `
      id,
      name,
      industry,
      reporting_subject_competitors (id, name)
    `,
    )
    .eq('organization_id', organization_id);

  if (error) {
    console.error('Error fetching brands:', error);
    return res.status(500).json({ error: 'Failed to fetch brands.' });
  }

  const brands = subjects.map((s) => ({
    id: s.id,
    name: s.name,
    industry: s.industry,
    competitors: s.reporting_subject_competitors,
  }));

  return res.status(200).json(brands);
}

export async function createBrand(req: Request, res: Response) {
  const organization_id = req.user!.organization_id;
  const { name, industry, competitors } = req.body;

  if (!name || !industry || !Array.isArray(competitors)) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: name, industry, competitors (must be an array)' });
  }

  const { data: subject, error: subjectError } = await supabaseAdmin
    .from('reporting_subject')
    .insert({ name, industry, organization_id })
    .select()
    .single();

  if (subjectError) {
    console.error('Error creating brand:', subjectError);
    return res.status(500).json({ error: 'Failed to create brand.' });
  }

  let competitorData = [];
  if (competitors.length > 0) {
    const competitorRecords = competitors.map((compName: string) => ({
      name: compName,
      reporting_subject_id: subject.id,
    }));

    const { data, error: competitorError } = await supabaseAdmin
      .from('reporting_subject_competitors')
      .insert(competitorRecords)
      .select();

    if (competitorError) {
      console.error('Error adding competitors:', competitorError);
      return res.status(500).json({ error: 'Brand created, but failed to add competitors.' });
    }
    competitorData = data;
  }

  return res.status(201).json({
    ...subject,
    competitors: competitorData,
  });
}
