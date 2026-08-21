import { Skill } from './Skill';

export const FrontendSkill: Skill = {
  id: 'frontend',
  name: 'Frontend Development',
  description: 'React, HTML/CSS, Tailwind, component design, responsive layouts, browser APIs.',
  requiredToolIds: ['readFile', 'writeFile', 'runCommand'],
  systemPromptFragment: `
## Frontend Skill Active

You are operating in Frontend mode. Apply these principles:

### Stack Knowledge
- React 18+ with TypeScript, hooks, functional components
- CSS: Tailwind CSS, CSS Modules, CSS variables, flexbox/grid
- Build tools: Vite, webpack, esbuild
- State: React Query, Zustand, useState/useContext
- Routing: React Router v6

### Design Principles
- Mobile-first responsive design
- Semantic HTML5 (section, article, nav, main, aside)
- Accessibility: ARIA labels, keyboard navigation, WCAG 2.1 AA
- Performance: lazy loading, code splitting, memoization

### Code Standards
- Always use TypeScript interfaces for props
- Prefer named exports over default exports for components
- CSS: use CSS custom properties for theming (--color-primary, etc.)
- No inline styles unless dynamic values are needed

### Checklist Before Writing Code
1. Read existing files to understand the component structure
2. Follow the existing naming conventions
3. Keep components under 200 lines — extract sub-components if needed
4. Always handle loading and error states
5. Run \`pnpm typecheck\` after changes
`
};
