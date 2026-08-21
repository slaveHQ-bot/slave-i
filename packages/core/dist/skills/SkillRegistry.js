import { FrontendSkill } from './FrontendSkill';
import { BackendSkill } from './BackendSkill';
import { DatabaseSkill } from './DatabaseSkill';
import { DevOpsSkill } from './DevOpsSkill';
import { TestingSkill } from './TestingSkill';
import { SecurityAuditSkill } from './SecurityAuditSkill';
import { UIUXSkill } from './UIUXSkill';
import { CopywritingSkill } from './CopywritingSkill';
import { DataAnalysisSkill } from './DataAnalysisSkill';
export class SkillRegistry {
    static instance;
    skills = new Map();
    constructor() {
        this.register(FrontendSkill);
        this.register(BackendSkill);
        this.register(DatabaseSkill);
        this.register(DevOpsSkill);
        this.register(TestingSkill);
        this.register(SecurityAuditSkill);
        this.register(UIUXSkill);
        this.register(CopywritingSkill);
        this.register(DataAnalysisSkill);
    }
    static getInstance() {
        if (!SkillRegistry.instance) {
            SkillRegistry.instance = new SkillRegistry();
        }
        return SkillRegistry.instance;
    }
    register(skill) {
        this.skills.set(skill.id, skill);
    }
    getSkill(id) {
        return this.skills.get(id);
    }
    getSkills(ids) {
        return ids.map(id => this.skills.get(id)).filter(Boolean);
    }
    getAllSkills() {
        return Array.from(this.skills.values());
    }
    /**
     * Given an objective string, heuristically select relevant skills.
     * Slaves can use this to auto-load appropriate skills per task.
     */
    inferSkills(objective) {
        const lower = objective.toLowerCase();
        const matched = [];
        if (/react|vue|angular|html|css|tailwind|component|ui|frontend|landing page|website/i.test(lower))
            matched.push(FrontendSkill);
        if (/api|server|node|express|fastapi|python|backend|rest|graphql|auth|endpoint/i.test(lower))
            matched.push(BackendSkill);
        if (/sql|database|schema|migration|drizzle|prisma|postgres|sqlite|query|table/i.test(lower))
            matched.push(DatabaseSkill);
        if (/docker|ci|cd|deploy|build|pipeline|nginx|kubernetes|devops|env/i.test(lower))
            matched.push(DevOpsSkill);
        if (/test|spec|jest|vitest|coverage|unit|integration|e2e|assert/i.test(lower))
            matched.push(TestingSkill);
        if (/security|auth|permission|vulnerability|audit|secret|credential|sanitize/i.test(lower))
            matched.push(SecurityAuditSkill);
        if (/design|ux|wireframe|accessibility|wcag|user flow|prototype|figma/i.test(lower))
            matched.push(UIUXSkill);
        if (/copy|headline|tagline|blog|article|write|content|email|persuasive|seo/i.test(lower))
            matched.push(CopywritingSkill);
        if (/data|statistic|chart|graph|analysis|pandas|csv|excel|visualization|insight/i.test(lower))
            matched.push(DataAnalysisSkill);
        return matched;
    }
}
