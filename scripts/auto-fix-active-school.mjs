import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src");

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;

    let source = fs.readFileSync(full, "utf8");
    
    // Pattern to catch all variations of school_members ... single()
    const memberRegex = /const\s+\{\s*data\s*:\s*member(?:Data)?(?:,\s*error\s*:\s*memberError\s*)?\}\s*=\s*await\s+supabase[\s\S]{10,250}?school_members[\s\S]{10,250}?\.single\(\)\s*;/g;
    
    let changed = false;

    source = source.replace(memberRegex, (match) => {
       changed = true;
       if (match.includes("memberData") || match.includes("memberError")) {
          return 'const { active: memberData } = await requireActiveSchool();\n  const memberError = null;';
       }
       return 'const { active: member } = await requireActiveSchool();';
    });

    if (changed) {
      if (!source.includes("requireActiveSchool")) {
        source = `import { requireActiveSchool } from "@/lib/schools/active-school";\n` + source;
      }
      fs.writeFileSync(full, source);
      console.log("Fixed:", full);
    }
  }
}

walk(root);
