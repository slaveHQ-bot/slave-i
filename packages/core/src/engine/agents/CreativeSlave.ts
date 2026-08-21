import { BaseSlave, AgentInfo } from './BaseSlave';
import { getWorkerTools } from '../../llm/workerTools';
import { Skill } from '../../skills/Skill';
import { UIUXSkill } from '../../skills/UIUXSkill';
import { CopywritingSkill } from '../../skills/CopywritingSkill';

/**
 * CreativeSlave — Multi-Skill Creative Agent (Tier 2: Productivity)
 *
 * Skills:
 *   uiux · copywriting
 *   (more can be added: presentation, branding, video direction, etc.)
 */
export class CreativeSlave extends BaseSlave {
  readonly agentInfo: AgentInfo = {
    id: 'creative_slave',
    name: 'Creative Slave',
    description: 'Multi-skill creative agent with composable skills: UI/UX design, copywriting, presentations, branding, and creative direction.'
  };

  protected getTools(onStatusUpdate: (msg: string) => void): Record<string, any> {
    const allTools = getWorkerTools(onStatusUpdate);
    return {
      readFile: allTools.readFile,
      writeFile: allTools.writeFile,
      runCommand: allTools.runCommand,
      fetchUrl: allTools.fetchUrl
    };
  }

  protected buildSkillsForObjective(objective: string): Skill[] {
    const { SkillRegistry } = require('../../skills/SkillRegistry');
    const inferred = SkillRegistry.getInstance().inferSkills(objective);
    // Always load at least one creative skill
    if (inferred.length === 0) return [CopywritingSkill];
    return inferred;
  }

  protected getSystemPrompt(): string {
    return `You are CreativeSlave, the multi-skill creative specialist of the Slave OS.

## Core Role
You produce COMPLETE, WORKING creative deliverables.
You do NOT produce descriptions of what you would make — you produce the actual artifact.

## Deliverable Standards
- **UI/Design tasks**: Produce actual, complete HTML/CSS files the user can open in a browser
- **Writing tasks**: Produce the actual copy, article, or document — not an outline
- **Presentation tasks**: Produce actual slide files or structured markdown
- **Branding tasks**: Produce actual brand guidelines with hex codes, font names, voice rules

## Creative Process
1. Understand the target audience and desired outcome
2. Identify which creative skill(s) apply (guided by skill fragments below)
3. Research any references or context provided
4. Produce the deliverable — complete, polished, ready to use
5. Offer 1-2 alternative variations or A/B options when relevant

## Rules
- Always produce complete output — no placeholders, no "TODO: add content here"
- Match the brand voice and aesthetic to the context
- For UI: make it visually stunning — dark mode, smooth gradients, micro-animations
- For copy: make every word earn its place
- Save output to appropriate files with descriptive names`;
  }
}
