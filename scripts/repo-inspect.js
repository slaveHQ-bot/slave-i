const fs = require('fs');
const { execSync } = require('child_process');

function run(cmd) {
    try {
        return execSync(cmd, { stdio: 'pipe' }).toString().trim();
    } catch (e) {
        return 'error';
    }
}

const report = {
    nodeVersion: run('node -v'),
    packageManager: 'pnpm',
    gitBranch: run('git branch --show-current'),
    gitStatus: run('git status --porcelain').length === 0 ? 'clean' : 'dirty',
    workspaces: fs.readdirSync('./packages').concat(fs.readdirSync('./apps')),
    scripts: JSON.parse(fs.readFileSync('./package.json')).scripts
};

console.log(JSON.stringify(report, null, 2));
