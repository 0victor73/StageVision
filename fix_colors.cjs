const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// The replacements we want to make
const replacements = [
  { regex: /"#27272A"/g, replacement: '"var(--panel-bg)"' },
  { regex: /"#18181B"/g, replacement: '"var(--header-bg)"' },
  { regex: /"#3F3F46"/g, replacement: '"var(--border)"' },
  { regex: /"#52525B"/g, replacement: '"var(--hover-bg)"' },
  { regex: /"#E2E8F0"/g, replacement: '"var(--text)"' },
  { regex: /"#eee"/ig, replacement: '"var(--text-h)"' },
  { regex: /"#fff"/ig, replacement: '"var(--text-h)"' },
  { regex: /"#ffffff"/ig, replacement: '"var(--text-h)"' },
  { regex: /"#a1a1aa"/ig, replacement: '"var(--text)"' },
  { regex: /"#888"/ig, replacement: '"var(--text-muted)"' },
  { regex: /"#666"/ig, replacement: '"var(--text-muted)"' },
  { regex: /"#555"/ig, replacement: '"var(--text-muted)"' },
  { regex: /"#444"/ig, replacement: '"var(--text-muted)"' },
  // Wait, let's keep some hardcoded colors for the Screen mockups (black, linear-gradients, etc)
  // Accent color
  { regex: /"#10B981"/g, replacement: '"var(--accent)"' },
  { regex: /isTransitioning \? "#065f46" : "var\(--accent\)"/g, replacement: 'isTransitioning ? "var(--accent-bg)" : "var(--accent)"' }
];

// Replace all except in the Screen component
// Find the index of "export default function App() {"
const appStartIdx = content.indexOf('export default function App() {');
if (appStartIdx > -1) {
  let beforeApp = content.substring(0, appStartIdx);
  let afterApp = content.substring(appStartIdx);

  replacements.forEach(r => {
    afterApp = afterApp.replace(r.regex, r.replacement);
  });

  content = beforeApp + afterApp;
  fs.writeFileSync(appPath, content, 'utf8');
  console.log("Replaced colors successfully!");
} else {
  console.log("Could not find App function");
}
