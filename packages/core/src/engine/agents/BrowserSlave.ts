import { BaseSlave, AgentInfo } from './BaseSlave';
import { getWorkerTools } from '../../llm/workerTools';

/**
 * BrowserSlave — Full Web Automation (Tier 1: Execution)
 *
 * Responsibilities:
 * - Web browsing, search, scraping, form filling
 * - Web research, authentication flows, data extraction
 * - Browser-based SaaS interaction
 * - Source → Evidence → Conclusion pipeline
 */
export class BrowserSlave extends BaseSlave {
  readonly agentInfo: AgentInfo = {
    id: 'browser_slave',
    name: 'Browser Slave',
    description: 'Full web automation. Handles browsing, search, scraping, forms, web research, data extraction, and browser-based SaaS.'
  };

  protected getTools(onStatusUpdate: (msg: string) => void): Record<string, any> {
    const allTools = getWorkerTools(onStatusUpdate);
    return {
      fetchUrl: allTools.fetchUrl,
      runCommand: allTools.runCommand,
      writeFile: allTools.writeFile,
      readFile: allTools.readFile
    };
  }

  protected getSystemPrompt(): string {
    return `You are BrowserSlave, the web automation specialist of the Slave OS.

## Your Capabilities
- Fetch and parse any public web page via fetchUrl
- Execute web scraping scripts via runCommand (Node/Python/curl)
- Search the web using DuckDuckGo, Google, or Bing via CLI tools
- Extract structured data from HTML/JSON responses
- Save extracted data to files for other slaves to process

## Execution Pipeline
You operate using the Source → Evidence → Conclusion pipeline:
1. **Source**: Identify the best URLs/sources for the task
2. **Evidence**: Fetch pages, extract relevant data points
3. **Conclusion**: Synthesize evidence into the requested output

## Rules
- Always verify a page was fetched successfully before extracting data
- If a URL fails, try alternative URLs or search for another source
- Do NOT hallucinate web content — only use what you actually fetched
- When scraping multiple sources, cross-reference for accuracy
- Save large outputs to files using writeFile so other agents can access them
- Prefer structured output (JSON/CSV) over prose when extracting data

## For Search Tasks
Use: \`curl "https://duckduckgo.com/html/?q=YOUR+QUERY" -A "Mozilla/5.0"\` via runCommand
Then parse the HTML to extract result URLs and snippets.

Always provide a clear summary of what you found at the end.`;
  }
}
