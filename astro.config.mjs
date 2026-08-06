import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://willardhucks.com',
  output: 'static',
  // Old GitHub Pages project-path URLs; keeps the provenance-badge links in
  // the frozen gallery pages (and any external links) working.
  redirects: {
    '/cv': '/',
    '/cv/resumes': '/resumes'
  }
});
