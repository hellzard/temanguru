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
  if (content.includes("member.school_id") || content.includes("context.school_id") || content.includes("active.school_id")) {
    content = content.replace(/member\.school_id/g, "member.schoolId");
    content = content.replace(/context\.school_id/g, "context.schoolId");
    content = content.replace(/active\.school_id/g, "active.schoolId");
    fs.writeFileSync(filePath, content);
    console.log(`Fixed school_id in ${filePath}`);
    count++;
  }
});
console.log(`Fixed ${count} files.`);
