const fs = require('fs');
const file = 'src/app/(dashboard)/settings/academic-years/client.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('setActiveAcademicYear', 'activateAcademicYear');
content = content.replace('setActiveAcademicYear', 'activateAcademicYear');
fs.writeFileSync(file, content);
console.log("Done");
