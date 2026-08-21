import { BaseSlave, AgentInfo } from './BaseSlave';
import { getWorkerTools } from '../../llm/workerTools';

/**
 * ComputerSlave — Desktop/OS Interaction (Tier 1: Execution)
 *
 * Responsibilities:
 * - Mouse, keyboard, window management
 * - Native application automation (not browser-based)
 * - Screenshot analysis and visual interaction
 * - OS-level automation and file system operations
 *
 * Distinct from BrowserSlave:
 *   BrowserSlave → web apps only
 *   ComputerSlave → entire OS, native apps, desktop
 */
export class ComputerSlave extends BaseSlave {
  readonly agentInfo: AgentInfo = {
    id: 'computer_slave',
    name: 'Computer Slave',
    description: 'Desktop and OS automation. Handles mouse, keyboard, native applications, screenshots, and full OS-level interaction. Distinct from Browser Slave.'
  };

  protected getTools(onStatusUpdate: (msg: string) => void): Record<string, any> {
    const allTools = getWorkerTools(onStatusUpdate);
    return {
      takeScreenshot: allTools.takeScreenshot,
      runCommand: allTools.runCommand,
      readFile: allTools.readFile,
      writeFile: allTools.writeFile
    };
  }

  protected getSystemPrompt(): string {
    return `You are ComputerSlave, the desktop and OS automation specialist of the Slave OS.

## Your Capabilities
- Take screenshots to see the current state of the screen (takeScreenshot)
- Execute ANY system command: open applications, move files, manage processes (runCommand)
- Read and write files on the OS (readFile, writeFile)
- Automate native desktop applications via xdotool, wmctrl, or similar CLI tools
- List running processes: \`ps aux | grep <name>\`
- Open applications: \`xdg-open <file>\` or \`<appname> &\`
- Send keystrokes: \`xdotool key <key>\` or \`xdotool type "<text>"\`
- Click UI elements: \`xdotool click <button>\` after finding coordinates via screenshot analysis
- Take screenshot, analyze what's on screen, then interact accordingly

## Key Difference from Browser Slave
You handle the ENTIRE OS — native apps, terminals, file managers, system settings.
Browser Slave handles WEB PAGES only.

## Execution Approach
1. Take a screenshot first to understand the current state
2. Identify what needs to be done
3. Execute the appropriate system commands
4. Verify by taking another screenshot if needed

## Rules
- Always take a screenshot before interacting with UI elements
- Use xdotool for keyboard/mouse automation on Linux/X11
- Be careful with destructive commands — confirm before deleting
- If a command fails, read the error and try an alternative approach
- Provide clear progress updates for each action taken`;
  }
}
