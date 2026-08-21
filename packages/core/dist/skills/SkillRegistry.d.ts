import { Skill } from './Skill';
export declare class SkillRegistry {
    private static instance;
    private skills;
    private constructor();
    static getInstance(): SkillRegistry;
    private register;
    getSkill(id: string): Skill | undefined;
    getSkills(ids: string[]): Skill[];
    getAllSkills(): Skill[];
    /**
     * Given an objective string, heuristically select relevant skills.
     * Slaves can use this to auto-load appropriate skills per task.
     */
    inferSkills(objective: string): Skill[];
}
