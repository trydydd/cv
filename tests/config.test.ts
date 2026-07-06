import { describe, expect, it } from 'vitest';
import {
  getGalleryResumes,
  getGoldResume,
  resolveRoleTarget,
  validateRoleLabel,
  validateSiteConfig,
} from '../src/lib/config';
import type { ResumeRegistry, SiteConfig } from '../src/lib/types';

const siteConfig: SiteConfig = {
  site: { title: 'Test', description: 'Test site' },
  roles: {
    tech: { label: 'Tech', description: 'Compare', target: 'gallery' },
    everyone: { label: 'Everyone', description: 'Gold', target: 'gold' },
  },
  goldResumeId: 'frontier-gold',
};

const registry: ResumeRegistry = {
  resumes: [
    {
      id: 'frontier-gold',
      label: 'Gold Standard',
      description: 'Gold resume',
      tier: 'frontier',
      provider: 'Synthetic Frontier',
      model: 'frontier-demo',
      enabled: true,
      showInGallery: true,
      isGoldCandidate: true,
      generatedAt: '2026-07-06T00:00:00Z',
      promptVersion: 1,
      resumeHash: 'abc',
      pdfPath: '/resumes/frontier-gold.pdf',
      candidate: {
        name: 'Jordan Example',
        title: 'Engineer',
        summary: 'Summary',
        contact: { location: 'Remote', email: 'jordan@example.com', website: 'https://example.com' },
        highlights: ['Impact'],
        experience: [{ company: 'Example', role: 'Engineer', period: '2020 – Present', bullets: ['Built things'] }],
        skills: ['TypeScript'],
      },
    },
    {
      id: 'disabled-demo',
      label: 'Disabled Demo',
      description: 'Hidden resume',
      tier: 'local',
      provider: 'Local',
      model: 'local-demo',
      enabled: false,
      showInGallery: true,
      isGoldCandidate: false,
      generatedAt: '2026-07-06T00:00:00Z',
      promptVersion: 1,
      resumeHash: 'def',
      pdfPath: '/resumes/disabled-demo.pdf',
      candidate: {
        name: 'Jordan Example',
        title: 'Engineer',
        summary: 'Summary',
        contact: { location: 'Remote', email: 'jordan@example.com', website: 'https://example.com' },
        highlights: ['Impact'],
        experience: [{ company: 'Example', role: 'Engineer', period: '2020 – Present', bullets: ['Built things'] }],
        skills: ['TypeScript'],
      },
    },
  ],
};

describe('site routing', () => {
  it('routes Everyone to the configured gold resume', () => {
    expect(resolveRoleTarget('everyone', siteConfig)).toBe('/resume/frontier-gold');
  });

  it('routes Tech to the configurable gallery', () => {
    expect(resolveRoleTarget('tech', siteConfig)).toBe('/resumes');
  });
});

describe('registry validation', () => {
  it('resolves the enabled gold-standard resume', () => {
    expect(getGoldResume(siteConfig, registry).id).toBe('frontier-gold');
  });

  it('shows only enabled gallery resumes', () => {
    expect(getGalleryResumes(registry).map((resume) => resume.id)).toEqual(['frontier-gold']);
  });

  it('rejects role labels longer than two words', () => {
    expect(() => validateRoleLabel('Tech Tinkerers Curious')).toThrow(/one or two words/);
  });

  it('rejects a missing gold resume id', () => {
    expect(() => validateSiteConfig({ ...siteConfig, goldResumeId: 'missing' }, registry)).toThrow(/was not found/);
  });

  it('rejects a disabled gold resume', () => {
    expect(() => validateSiteConfig({ ...siteConfig, goldResumeId: 'disabled-demo' }, registry)).toThrow(/must be enabled/);
  });

  it('rejects duplicate resume ids', () => {
    expect(() => validateSiteConfig(siteConfig, { resumes: [registry.resumes[0], registry.resumes[0]] })).toThrow(/Duplicate/);
  });
});
