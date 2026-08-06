const fs = require('fs');
const files = [
  'src/app/(dashboard)/events/client.tsx',
  'src/app/(dashboard)/operations/duty/client.tsx',
  'src/app/(dashboard)/operations/maintenance/client.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /const result = await ([a-zA-Z0-9_]+)\(initialState, formData\);\s+if \(result\.success\) \{\s+toast\.success\(result\.message\);\s+setIsFormOpen\(false\);\s+\} else \{\s+toast\.error\(result\.message\);\s+\}/,
    `try {\n        await $1(formData);\n      } catch (e: any) {\n        if (e?.message?.includes("NEXT_REDIRECT")) throw e;\n        toast.error("Terjadi kesalahan.");\n      }`
  );
  fs.writeFileSync(file, content);
}

const files2 = [
  'src/app/(dashboard)/settings/subjects/client.tsx',
  'src/app/(dashboard)/settings/academic-years/client.tsx',
  'src/app/(dashboard)/schedules/new/client.tsx'
];

for (const file of files2) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /const res = await ([a-zA-Z0-9_]+)\(prevState, formData\);\s+if \(res\.error\) return \{ error: res\.error, success: false \};\s+return \{ error: null, success: true \};/,
    `try {\n      await $1(formData);\n      return { error: null, success: true };\n    } catch (e: any) {\n      if (e?.message?.includes("NEXT_REDIRECT")) throw e;\n      return { error: "Terjadi kesalahan", success: false };\n    }`
  );
  fs.writeFileSync(file, content);
}

console.log("Done");
