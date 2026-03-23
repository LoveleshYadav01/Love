const { execSync } = require('child_process');
const output = execSync('git log --oneline -n 12').toString();
const lines = output.split('\n').map(l => l.substring(0, 50));
console.log(lines.join('\n'));
