import { apiGet, apiPatch, apiPost } from '@/lib/apiClient';
import { Brand, Competitor, CreateBrandInput } from '@/types/brand';

export async function getBrands(): Promise<Brand[]> {
  return apiGet<Brand[]>('/brands');
}

export async function createBrand(input: CreateBrandInput): Promise<Brand> {
  return apiPost<Brand>('/brands', input);
}

export async function updateBrand(
  id: string,
  input: Pick<CreateBrandInput, 'name' | 'industry'>,
): Promise<Brand> {
  return apiPatch<Brand>(`/brands/${id}`, input);
}

export async function updateCompetitors(
  id: string,
  competitors: string[],
): Promise<Competitor[]> {
  const result = await apiPatch<{ competitors: Competitor[] }>(`/brands/${id}/competitors`, {
    competitors,
  });
  return result.competitors;
}
