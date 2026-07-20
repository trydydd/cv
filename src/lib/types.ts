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
  /**
   * Effective sampling parameters resolved from the inference server at
   * generation time (scripts/lib/model-server.mjs#resolveSamplingParams) —
   * includes values that fell through to the server/model's own defaults,
   * not just ones explicitly passed. Absent for resumes not generated
   * through the local vLLM pipeline (e.g. the gold resume).
   */
  samplingParams?: Record<string, number>;
  pdfPath?: string;
  /**
   * Site-relative URL to a self-contained, model-authored static page
   * (see inputs/prompt.md). When present, gallery links go straight to
   * this page instead of the shared /resume/:id template, and `candidate`
   * is not required.
   */
  pageUrl?: string;
  /**
   * Repo-relative path to a YAML file containing a top-level `candidate:`
   * key (see inputs/resume.yaml). When present, loadResumeRegistry() reads
   * it and fills in `candidate`, so the data only has to be maintained once.
   * Takes precedence over an inline `candidate` block if both are set.
   */
  candidateSource?: string;
  candidate?: {
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

export type StructuredResumeEntry = ResumeEntry & { candidate: NonNullable<ResumeEntry['candidate']> };
