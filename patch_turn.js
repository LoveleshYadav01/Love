const fs = require('fs');

try {
  let content = fs.readFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', 'utf-8');
  content = content.replace(/\r\n/g, '\n');

  // TURN Configuration String
  const pConfStr = `
  const pConf = {
    config: {
      'iceServers': [
        { urls: 'stun:openrelay.metered.ca:80' },
        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
      ]
    }
  };`;

  // 1. apply to doAuth
  const oldDoAuth = `  S.msgs = [];
  renderMsgs();
  
  S.peer = new Peer();
  
  S.peer.on('open', id => {`;
  
  const newDoAuth = `  S.msgs = [];
  renderMsgs();
  ${pConfStr}
  S.peer = new Peer(pConf);
  
  S.peer.on('open', id => {`;
  content = content.replace(oldDoAuth, newDoAuth);

  // 2. apply to becomeHost
  const oldBecomeHost = `function becomeHost(hostId) {
  S.peer.destroy();
  S.peer = new Peer(hostId);`;

  const newBecomeHost = `function becomeHost(hostId) {
  S.peer.destroy();${pConfStr}
  S.peer = new Peer(hostId, pConf);`;
  content = content.replace(oldBecomeHost, newBecomeHost);

  fs.writeFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', content);
  console.log("TURN Server Patch perfectly applied!");
} catch(e) { console.log(e); }
