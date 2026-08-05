import fs from "fs";
import path from "path";

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      callback(fullPath);
    }
  }
}

let count = 0;
walkDir("src", (filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  if (content.includes("requireActiveSchool") && !content.includes("import { requireActiveSchool }")) {
    const lines = content.split("\n");
    const importIndex = lines.findIndex(line => line.startsWith("import "));
    if (importIndex !== -1) {
      lines.splice(importIndex, 0, `import { requireActiveSchool } from "@/lib/schools/active-school";`);
      content = lines.join("\n");
      fs.writeFileSync(filePath, content);
      console.log(`Added import to ${filePath}`);
      count++;
    } else {
      lines.unshift(`import { requireActiveSchool } from "@/lib/schools/active-school";`);
      content = lines.join("\n");
      fs.writeFileSync(filePath, content);
      console.log(`Added import to ${filePath}`);
      count++;
    }
  }
});
console.log(`Fixed ${count} files.`);
