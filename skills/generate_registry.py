import json
import os

skills = [
    ("automation/browser", "engineering", "Control and inspect browser sessions.", ["browser", "web", "automation"]),
    ("automation/computer-control", "engineering", "Control desktop environment and execute OS commands.", ["os", "desktop", "control"]),
    ("core/agent-protocol", "core", "Standard communication and negotiation protocol for all agents.", ["protocol", "communication"], True),
    ("core/elite-engineer", "core", "High-level engineering mindset, problem solving, and architecture rules.", ["engineering", "architecture", "mindset"], True),
    ("core/evidence-reporter", "core", "Rules for producing verifiable, evidence-backed reports.", ["report", "evidence", "verification"], True),
    ("core/repo-explorer", "core", "Guidelines for navigating, inspecting, and understanding the codebase before execution.", ["exploration", "inspection", "search"], True),
    ("core/task-executor", "core", "Standard procedures for executing and validating a delegated task.", ["execution", "task", "implementation"], True),
    ("design/design-system", "design", "Maintain and apply the global design system.", ["design", "css", "theme"]),
    ("design/product-manager", "product", "Translate user intent into product requirements and scope.", ["product", "requirements", "scope"]),
    ("design/ui-ux", "design", "Design rich, accessible, and user-friendly interfaces.", ["ui", "ux", "interface"]),
    ("design/ux-research", "design", "Analyze user behavior and design best practices.", ["research", "ux", "behavior"]),
    ("engineering/backend", "engineering", "Implement server-side logic, API endpoints, and business rules.", ["backend", "api", "server"]),
    ("engineering/database", "engineering", "Design schemas, write migrations, and optimize queries.", ["database", "sql", "schema"]),
    ("engineering/electron", "engineering", "Build and maintain the Electron main process and IPC boundary.", ["electron", "desktop", "ipc"]),
    ("engineering/frontend", "engineering", "Implement UI components and client-side logic.", ["frontend", "react", "ui"]),
    ("infrastructure/devops", "infrastructure", "Manage CI/CD, build processes, and infrastructure.", ["devops", "ci", "build"]),
    ("infrastructure/release", "infrastructure", "Coordinate and execute software releases.", ["release", "versioning", "publish"]),
    ("intelligence/agent-systems", "intelligence", "Design and maintain agent runtimes, registries, and orchestration.", ["agent", "runtime", "orchestration"]),
    ("intelligence/llm", "intelligence", "Integrate model providers and handle prompt engineering.", ["llm", "prompt", "model"]),
    ("intelligence/memory", "intelligence", "Manage vector stores, context graphs, and episodic memory.", ["memory", "vector", "context"]),
    ("main-agent/architecture-reviewer", "main-agent", "Review architectural proposals and enforce boundaries.", ["review", "architecture", "boundaries"]),
    ("main-agent/cto-orchestrator", "main-agent", "Plan, delegate, coordinate, and review all agent work.", ["cto", "orchestration", "planning"]),
    ("main-agent/engineering-planner", "main-agent", "Break down goals into execution graphs and parallel tasks.", ["planning", "task-graph", "breakdown"]),
    ("quality/code-review", "quality", "Review code for correctness, maintainability, and style.", ["review", "code", "quality"]),
    ("quality/performance", "quality", "Analyze and optimize system performance and resource usage.", ["performance", "optimization", "speed"]),
    ("quality/qa", "quality", "Write and execute test plans, verify outcomes.", ["qa", "testing", "verification"]),
    ("quality/security", "quality", "Audit code for vulnerabilities and enforce security boundaries.", ["security", "audit", "vulnerability"]),
    ("research/competitive-intelligence", "research", "Analyze competitors and market trends.", ["research", "competitors", "market"]),
    ("research/research", "research", "Conduct general technical and domain research.", ["research", "investigation", "analysis"])
]

registry = []
for path, cat, desc, triggers, *core_flag in skills:
    is_core = bool(core_flag) if core_flag else False
    name = path.split('/')[-1]
    
    entry = {
        "name": name,
        "path": f"{path}/SKILL.md",
        "category": cat,
        "description": desc,
        "core": is_core,
        "alwaysLoad": is_core,
        "triggers": triggers,
        "requiredSkills": ["elite-engineer", "repo-explorer", "task-executor", "evidence-reporter", "agent-protocol"] if not is_core else [],
        "recommendedSkills": [],
        "relatedSkills": [],
        "conflicts": [],
        "version": "1.0.0"
    }
    registry.append(entry)

with open('/home/omkhalane/Desktop/slave/skills/skill-registry.json', 'w') as f:
    json.dump(registry, f, indent=2)

index_md = "# Slave Engineering Skill Index\n\nThis index lists all available skills in the registry.\n\n"
for entry in registry:
    index_md += f"## {entry['name']}\n"
    index_md += f"- **Category**: {entry['category']}\n"
    index_md += f"- **Path**: `{entry['path']}`\n"
    index_md += f"- **Core**: {entry['core']}\n"
    index_md += f"- **Description**: {entry['description']}\n\n"

with open('/home/omkhalane/Desktop/slave/skills/SKILL_INDEX.md', 'w') as f:
    f.write(index_md)
