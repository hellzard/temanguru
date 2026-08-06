const fs = require('fs');
const path = require('path');

const overhaulPath = path.join('..', 'temanguru-ui-overhaul.md');
const content = fs.readFileSync(overhaulPath, 'utf8');

const regex = /### `([^`]+)`\n\n```[a-z]*\n([\s\S]*?)\n```/g;
let match;
let count = 0;

while ((match = regex.exec(content)) !== null) {
  const filePath = match[1];
  const fileContent = match[2];
  
  const absolutePath = path.join(__dirname, filePath);
  const dir = path.dirname(absolutePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(absolutePath, fileContent, 'utf8');
  console.log(`Wrote ${filePath}`);
  count++;
}

console.log(`Successfully extracted and wrote ${count} files.`);
