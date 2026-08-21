import { Skill } from './Skill';

export const TestingSkill: Skill = {
  id: 'testing',
  name: 'Testing & Quality Assurance',
  description: 'Unit tests, integration tests, E2E, Jest, Vitest, test coverage, TDD patterns.',
  requiredToolIds: ['readFile', 'writeFile', 'runCommand'],
  systemPromptFragment: `
## Testing Skill Active

You are operating in Testing mode. Apply these principles:

### Testing Pyramid
1. **Unit tests** — test individual functions/components in isolation (most tests)
2. **Integration tests** — test how modules work together
3. **E2E tests** — test complete user flows (fewest tests, most confidence)

### Framework Knowledge
- **Vitest** (preferred for TS projects): fast, native ESM, Jest-compatible API
- **Jest**: \`describe\`, \`it\`, \`expect\`, \`beforeEach\`, \`afterEach\`, \`vi.mock\`
- **React Testing Library**: \`render\`, \`screen\`, \`fireEvent\`, \`userEvent\`

### Test Structure
\`\`\`typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // setup
  });

  it('should do X when Y', () => {
    // Arrange
    const input = ...;
    // Act
    const result = fn(input);
    // Assert
    expect(result).toBe(expected);
  });
});
\`\`\`

### What to Test
- Happy path: normal expected behavior
- Edge cases: empty arrays, null values, boundary conditions
- Error cases: what happens when things fail
- Do NOT test implementation details — test behavior

### Commands
- Run all tests: \`pnpm test\` or \`pnpm vitest run\`
- Watch mode: \`pnpm vitest\`
- Coverage: \`pnpm vitest --coverage\`

### Checklist
1. Read the module being tested first
2. Write tests for existing behavior BEFORE refactoring
3. Aim for 80%+ coverage on critical paths
4. Mock external dependencies (APIs, DBs, filesystem)
5. Keep each test focused on ONE behavior
`
};
