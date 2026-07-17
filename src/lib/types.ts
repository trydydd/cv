export type RoleKey = 'tech' | 'everyone';
export type RoleTarget = 'gallery' | 'gold';

export interface SiteConfig {
  site: {
    title: string;
    description: string;
  };
  roles: Record<RoleKey, { label: string; description: string; target: RoleTarget }>;
  goldResumeId: string;
}

export interface ResumeEntry {
  id: string;
  label: string;
  description: string;
  tier: 'frontier' | 'hosted' | 'local' | 'baseline';
  provider: string;
  model: string;
  enabled: boolean;
  showInGallery: boolean;
  isGoldCandidate: boolean;
  generatedAt: string;
  promptVersion: number;
  resumeHash: string;
  pdfPath: string;
  candidate: {
    name: string;
    title?: string;
    tagline?: string;
    summary?: string;
    contact: {
      location?: string;
      email?: string;
      website?: string;
      phone?: string;
      github?: string;
    };
    highlights?: string[];
    experience?: Array<{
      company?: string;
      role?: string;
      title?: string;
      period?: string;
      dates?: string;
      location?: string;
      bullets?: string[];
      highlights?: string[];
    }>;
    projects?: Array<{
      name: string;
      status?: string;
      url?: string;
      highlights?: string[];
    }>;
    community?: Array<{
      role: string;
      organization: string;
      dates?: string;
      url?: string;
      highlights?: string[];
    }>;
    skills?: string[] | Record<string, string[]>;
    education_and_honors?: string[];
  };
}

export interface ResumeRegistry {
  resumes: ResumeEntry[];
}
