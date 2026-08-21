import { Skill } from './Skill';

export const DatabaseSkill: Skill = {
  id: 'database',
  name: 'Database Engineering',
  description: 'SQL, SQLite, Postgres, Drizzle ORM, schema design, migrations, query optimization.',
  requiredToolIds: ['readFile', 'writeFile', 'runCommand'],
  systemPromptFragment: `
## Database Skill Active

You are operating in Database mode. Apply these principles:

### ORM / Query Knowledge
- Drizzle ORM (TypeScript-first, used in this project)
- Raw SQL via sqlite3 CLI or pg CLI
- Migrations: Drizzle Kit (\`pnpm drizzle-kit generate\`, \`pnpm drizzle-kit push\`)
- Query patterns: select, insert, update, delete, joins, aggregations

### Schema Design Rules
- Always define explicit primary keys (UUID or auto-increment)
- Use snake_case for column names
- Add \`created_at\` and \`updated_at\` timestamps to all tables
- Prefer normalized schemas — avoid JSON blobs for queryable data
- Add indexes on columns used in WHERE clauses and foreign keys

### Performance Rules
- Use \`EXPLAIN QUERY PLAN\` to analyze slow queries
- Avoid N+1 queries — use JOINs or batch fetching
- Limit result sets — always add LIMIT for large tables
- Use transactions for multi-step operations

### Drizzle Pattern
\`\`\`typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at').notNull()
});
\`\`\`

### Checklist
1. Read existing schema files before adding columns
2. Write migration scripts for schema changes
3. Test queries with sample data via CLI before integrating
4. Add proper indexes for query patterns
`
};
