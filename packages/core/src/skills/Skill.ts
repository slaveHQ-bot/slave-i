/**
 * Skill — A composable capability fragment for any Slave agent.
 *
 * Skills add specialization without creating new agents.
 * They augment the slave's system prompt and declare which tools they require.
 */
export interface Skill {
  /** Unique identifier, e.g. "frontend", "copywriting" */
  id: string;
  /** Human-readable name */
  name: string;
  /** Short description of what this skill enables */
  description: string;
  /**
   * System prompt fragment injected into the slave's prompt when this skill is active.
   * Should be self-contained: provide all knowledge, rules, and patterns for this domain.
   */
  systemPromptFragment: string;
  /** Tool IDs this skill requires. The slave will make these available when the skill is loaded. */
  requiredToolIds: string[];
}
