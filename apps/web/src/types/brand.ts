export interface Competitor {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
  website?: string;
  industry: string;
  competitors: Competitor[];
}

export interface CreateBrandInput {
  name: string;
  industry: string;
  competitors: string[];
}
