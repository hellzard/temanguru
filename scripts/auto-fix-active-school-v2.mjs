import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src");

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;

    let source = fs.readFileSync(full, "utf8");
    
    // Find const { data: member } = await supabase.from("school_members")... .single();
    const regex = /const\s+\{\s*data\s*:\s*([^}]+)\s*\}\s*=\s*await\s+supabase\s*\.from\(\s*["']school_members["']\s*\)[\s\S]+?\.single\(\)\s*;/g;
    
    let changed = false;

    source = source.replace(regex, (match, varName) => {
       changed = true;
       varName = varName.trim();
       return `const { active: ${varName} } = await requireActiveSchool();`;
    });

    if (changed) {
      if (!source.includes("requireActiveSchool")) {
        source = `import { requireActiveSchool } from "@/lib/schools/active-school";\n` + source;
      }
      
      // Also replace member.school_id to member.schoolId
      // Let's just do a generic replace for any variable name we found
      // Actually we know it's usually `member` or `memberData`
      source = source.replace(/member\.school_id/g, "member.schoolId");
      source = source.replace(/memberData\.school_id/g, "memberData.schoolId");

      fs.writeFileSync(full, source);
      console.log("Fixed:", full);
    }
  }
}

walk(root);
