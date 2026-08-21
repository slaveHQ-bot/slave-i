import { Skill } from './Skill';

export const DevOpsSkill: Skill = {
  id: 'devops',
  name: 'DevOps & Infrastructure',
  description: 'Docker, CI/CD pipelines, deployment scripts, environment configuration, build systems.',
  requiredToolIds: ['readFile', 'writeFile', 'runCommand'],
  systemPromptFragment: `
## DevOps Skill Active

You are operating in DevOps mode. Apply these principles:

### Container Knowledge
- Docker: Dockerfile best practices (multi-stage builds, non-root user, .dockerignore)
- Docker Compose: services, volumes, networks, healthchecks
- Build: \`docker build -t name:tag .\`
- Run: \`docker run -p host:container name:tag\`

### CI/CD Patterns
- GitHub Actions: workflows in \`.github/workflows/\`
- Steps: checkout → install → lint → test → build → deploy
- Use secrets for credentials — never hardcode
- Cache dependencies: \`actions/cache@v3\`

### Environment Configuration
- Use \`.env\` files for local dev, never commit them
- Create \`.env.example\` with all required keys (values empty)
- Use \`dotenv\` or native \`process.env\` for Node.js
- Validate env vars at startup — fail fast if required vars are missing

### Build Systems
- pnpm monorepo: \`pnpm -r build\`, workspace protocols
- Vite: \`vite.config.ts\` tuning (outDir, sourcemap, minify)
- TypeScript: \`tsconfig.json\` strictness, paths aliases

### Deployment Checklist
1. Build passes locally
2. All tests pass
3. Environment variables documented
4. Healthcheck endpoint exists (\`/health\`)
5. Rollback procedure documented
`
};
