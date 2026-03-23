const { execSync } = require('child_process');
console.log(execSync('git log --oneline -n 12').toString());
