const fs = require('fs');

const files = [
  'src/app/(dashboard)/meetings/client.tsx',
  'src/app/(dashboard)/portfolios/client.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /const result = await ([a-zA-Z0-9_]+)\([^,]+,\s*formData\);\s*if \(result\.success\) \{\s*toast\.success\(result\.message\);\s*set[a-zA-Z0-9_]+\([^)]+\);\s*\} else \{\s*toast\.error\(result\.message\);\s*\}/g,
    `try {\n        await $1(formData);\n      } catch (e: any) {\n        if (e?.message?.includes("NEXT_REDIRECT")) throw e;\n        toast.error("Terjadi kesalahan.");\n      }`
  );
  fs.writeFileSync(file, content);
}
console.log("Done");
