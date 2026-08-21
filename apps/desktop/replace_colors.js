const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src/renderer/src/components'));

// Add App.tsx to the list
files.push(path.join(__dirname, 'src/renderer/src/App.tsx'));

const colorMap = {
  '#a855f7': '#ffffff',
  '#3b82f6': '#e5e5e5',
  '#f59e0b': '#cccccc',
  '#22c55e': '#ffffff',
  '#ef4444': '#ffffff',
  '#4ade80': '#ffffff',
  '#c4b5fd': '#ffffff',
  '#e2e8f0': '#ffffff',
  '#06b6d4': '#cccccc',
  '#080b12': '#000000',
  '#0f172a': '#000000',
  '#1e293b': '#000000',
  '#15151e': '#000000',
  'rgba(168,85,247,0.15)': 'rgba(255,255,255,0.15)',
  'rgba(168,85,247,0.08)': 'rgba(255,255,255,0.08)',
  'rgba(59,130,246,0.08)': 'rgba(255,255,255,0.08)',
  'rgba(245,158,11,0.08)': 'rgba(255,255,255,0.08)',
  'rgba(6,182,212,0.08)': 'rgba(255,255,255,0.08)',
  'rgba(34,197,94,0.08)': 'rgba(255,255,255,0.08)',
  'rgba(239,68,68,0.08)': 'rgba(255,255,255,0.08)'
};

files.forEach(file => {
  if (file.endsWith('.tsx') && !file.includes('MarkdownRenderer.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    for (const [oldColor, newColor] of Object.entries(colorMap)) {
      // Create a regex to match the color case-insensitively
      const regex = new RegExp(oldColor.replace(/([()[\]{}.])/g, '\\$1'), 'gi');
      content = content.replace(regex, newColor);
    }
    
    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`Updated ${file}`);
    }
  }
});
