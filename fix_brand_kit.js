const fs = require('fs');
const file = 'src/app/(dashboard)/settings/brand-kit/client.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const res = await saveBrandKit\(null, formData\);\s*if \(res\.error\) \{\s*toast\.error\(res\.error\);\s*\} else \{\s*toast\.success\([^)]+\);\s*\}/,
  `try {\n        await saveBrandKit(formData);\n      } catch (e: any) {\n        if (e?.message?.includes("NEXT_REDIRECT")) throw e;\n        toast.error("Terjadi kesalahan.");\n      }`
);

fs.writeFileSync(file, content);
console.log("Done");
