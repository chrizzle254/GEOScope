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

export async function updateBrand(req: Request, res: Response) {
  const organization_id = req.user!.organization_id;
  const { id } = req.params;
  const { name, industry } = req.body;

  if (!name || !industry) {
    return res.status(400).json({ error: 'Missing required fields: name, industry' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('reporting_subject')
      .update({ name, industry })
      .eq('id', id)
      .eq('organization_id', organization_id)
      .select(
        `
        id,
        name,
        industry,
        reporting_subject_competitors (id, name)
      `,
      )
      .single();

    if (error) {
      console.error('Error updating brand:', error);
      return res.status(500).json({ error: 'Failed to update brand.' });
    }

    return res.status(200).json({
      id: data.id,
      name: data.name,
      industry: data.industry,
      competitors: data.reporting_subject_competitors,
    });
  } catch (err) {
    console.error('Unexpected error updating brand:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function updateCompetitors(req: Request, res: Response) {
  const organization_id = req.user!.organization_id;
  const { id } = req.params;
  const { competitors } = req.body;

  if (!Array.isArray(competitors)) {
    return res.status(400).json({ error: 'competitors must be an array of strings.' });
  }

  if (competitors.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 competitors allowed.' });
  }

  try {
    // Verify ownership
    const { data: subject, error: subjectError } = await supabaseAdmin
      .from('reporting_subject')
      .select('id')
      .eq('id', id)
      .eq('organization_id', organization_id)
      .single();

    if (subjectError || !subject) {
      return res.status(404).json({ error: 'Brand not found.' });
    }

    // Replace: delete all existing, then insert new
    const { error: deleteError } = await supabaseAdmin
      .from('reporting_subject_competitors')
      .delete()
      .eq('reporting_subject_id', id);

    if (deleteError) {
      console.error('Error deleting competitors:', deleteError);
      return res.status(500).json({ error: 'Failed to update competitors.' });
    }

    let newCompetitors: Array<{ id: string; name: string }> = [];
    if (competitors.length > 0) {
      const records = competitors.map((name: string) => ({
        reporting_subject_id: id,
        name: String(name).trim(),
      }));

      const { data, error: insertError } = await supabaseAdmin
        .from('reporting_subject_competitors')
        .insert(records)
        .select('id, name');

      if (insertError) {
        console.error('Error inserting competitors:', insertError);
        return res.status(500).json({ error: 'Failed to save competitors.' });
      }

      newCompetitors = data ?? [];
    }

    return res.status(200).json({ competitors: newCompetitors });
  } catch (err) {
    console.error('Unexpected error in updateCompetitors:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
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
