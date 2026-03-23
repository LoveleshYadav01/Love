const fs = require('fs');
try {
  let content = fs.readFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', 'utf-8');
  content = content.replace(/\r\n/g, '\n');

  const oldP1 = `  const pConf = { config: { 'iceServers': [ { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' } ] } };
  S.peer = new Peer(pConf);`;
  const newP1 = `  S.peer = new Peer();`;
  content = content.replace(oldP1, newP1);

  const oldP2 = `  const pConf = { config: { 'iceServers': [ { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' } ] } };
  S.peer = new Peer(hostId, pConf);`;
  const newP2 = `  S.peer = new Peer(hostId);`;
  content = content.replace(oldP2, newP2);

  fs.writeFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', content);
  console.log("Revert patch successfully applied!");
} catch(e) {
  console.log("Error patch: ", e);
}
