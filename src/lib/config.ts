import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type { ResumeEntry, ResumeRegistry, RoleKey, SiteConfig } from './types';

const root = process.cwd();

function readYaml<T>(relativePath: string): T {
  const fullPath = path.join(root, relativePath);
  return YAML.parse(fs.readFileSync(fullPath, 'utf8')) as T;
}

export function loadSiteConfig(): SiteConfig {
  return readYaml<SiteConfig>('config/site.yaml');
}

export function loadResumeRegistry(): ResumeRegistry {
  return readYaml<ResumeRegistry>('config/resumes.yaml');
}

export function validateRoleLabel(label: string): void {
  const wordCount = label.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 1 || wordCount > 2) {
    throw new Error(`Role label "${label}" must be one or two words.`);
  }
}

export function validateSiteConfig(siteConfig: SiteConfig, registry: ResumeRegistry): void {
  const requiredRoles: RoleKey[] = ['tech', 'everyone'];
  for (const role of requiredRoles) {
    const roleConfig = siteConfig.roles[role];
    if (!roleConfig) throw new Error(`Missing required role: ${role}`);
    validateRoleLabel(roleConfig.label);
  }

  if (siteConfig.roles.tech.target !== 'gallery') {
    throw new Error('Tech role must target the gallery.');
  }

  if (siteConfig.roles.everyone.target !== 'gold') {
    throw new Error('Everyone role must target the gold resume.');
  }

  const ids = new Set<string>();
  for (const resume of registry.resumes) {
    if (ids.has(resume.id)) throw new Error(`Duplicate resume id: ${resume.id}`);
    ids.add(resume.id);
  }

  const gold = registry.resumes.find((resume) => resume.id === siteConfig.goldResumeId);
  if (!gold) throw new Error(`Gold resume "${siteConfig.goldResumeId}" was not found.`);
  if (!gold.enabled) throw new Error(`Gold resume "${siteConfig.goldResumeId}" must be enabled.`);
}

export function getEnabledResumes(registry = loadResumeRegistry()): ResumeEntry[] {
  return registry.resumes.filter((resume) => resume.enabled);
}

export function getGalleryResumes(registry = loadResumeRegistry()): ResumeEntry[] {
  return registry.resumes.filter((resume) => resume.enabled && resume.showInGallery);
}

export function getResumeById(id: string, registry = loadResumeRegistry()): ResumeEntry | undefined {
  return registry.resumes.find((resume) => resume.enabled && resume.id === id);
}

export function getGoldResume(siteConfig = loadSiteConfig(), registry = loadResumeRegistry()): ResumeEntry {
  validateSiteConfig(siteConfig, registry);
  const resume = getResumeById(siteConfig.goldResumeId, registry);
  if (!resume) throw new Error(`Gold resume "${siteConfig.goldResumeId}" is not enabled.`);
  return resume;
}

export function resolveRoleTarget(role: RoleKey, siteConfig = loadSiteConfig()): string {
  const roleConfig = siteConfig.roles[role];
  if (!roleConfig) throw new Error(`Unknown role: ${role}`);
  validateRoleLabel(roleConfig.label);

  if (roleConfig.target === 'gallery') return '/resumes';
  if (roleConfig.target === 'gold') return `/resume/${siteConfig.goldResumeId}`;

  throw new Error(`Unsupported role target: ${roleConfig.target}`);
}
