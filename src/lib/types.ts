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
    title: string;
    summary: string;
    contact: {
      location: string;
      email: string;
      website: string;
    };
    highlights: string[];
    experience: Array<{
      company: string;
      role: string;
      period: string;
      bullets: string[];
    }>;
    skills: string[];
  };
}

export interface ResumeRegistry {
  resumes: ResumeEntry[];
}
