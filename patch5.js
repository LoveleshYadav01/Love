const fs = require('fs');
try {
  let content = fs.readFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', 'utf-8');
  content = content.replace(/\r\n/g, '\n');

  const oldDoAuth = `  const hash = await getSHA(idStr + pass);
  const hostId = 'akakan-' + hash + '-host';`;

  const newDoAuth = `  const cleanCreds = (idStr + pass).toLowerCase().replace(/[^a-z0-9]/g, '');
  const hostId = 'akakan-' + cleanCreds + '-host';`;
  
  content = content.replace(oldDoAuth, newDoAuth);

  // also remove async from doAuth since we don't await getSHA anymore
  content = content.replace('async function doAuth(){', 'function doAuth(){');

  fs.writeFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', content);
  console.log("Applied clean creds patch!");

} catch(e) { console.log(e); }
