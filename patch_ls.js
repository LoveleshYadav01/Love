const fs = require('fs');

try {
  let content = fs.readFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', 'utf-8');
  content = content.replace(/\r\n/g, '\n');

  // Replace doAuth mode checks and localStorage sets
  const oldDoAuth = `  const isPreviouslyCreator = !!localStorage.getItem('akakan_saved_account');
  const isCreatorMode = (mode === 'signup') || isPreviouslyCreator;
  
  if (mode === 'signup') {
     localStorage.setItem('akakan_saved_account', JSON.stringify({ id: idStr, pass: pass }));
     showToast("Account Created & Saved!");
  }
  
  if (isCreatorMode) {`;

  const newDoAuth = `  let isPreviouslyCreator = false;
  try { isPreviouslyCreator = !!localStorage.getItem('akakan_saved_account'); } catch(e){}
  const isCreatorMode = (mode === 'signup') || isPreviouslyCreator;
  
  if (mode === 'signup') {
     try { localStorage.setItem('akakan_saved_account', JSON.stringify({ id: idStr, pass: pass })); } catch(e){}
     showToast("Account Created & Saved!");
  }
  
  if (isCreatorMode) {`;
  content = content.replace(oldDoAuth, newDoAuth);

  // Replace setupConn localStorage gets
  const oldSetupConn = `function setupConn(conn) {
  S.conn = conn;
  const savedAcc = localStorage.getItem('akakan_saved_account');
  if (savedAcc) {
     try {
       const d = JSON.parse(savedAcc);
       if (d.name) {
         S.loginName = d.name;
         S.loggedIn = true;
       }
     } catch(e){}
  }`;

  const newSetupConn = `function setupConn(conn) {
  S.conn = conn;
  let savedAcc = null;
  try { savedAcc = localStorage.getItem('akakan_saved_account'); } catch(e){}
  if (savedAcc) {
     try {
       const d = JSON.parse(savedAcc);
       if (d.name) {
         S.loginName = d.name;
         S.loggedIn = true;
       }
     } catch(e){}
  }`;
  content = content.replace(oldSetupConn, newSetupConn);

  // Replace login/init localStorage
  const oldInitLS = `    const savedAcc = localStorage.getItem('akakan_saved_account');
    if (savedAcc) {`;
  const newInitLS = `    let savedAcc = null;
    try { savedAcc = localStorage.getItem('akakan_saved_account'); } catch(e){}
    if (savedAcc) {`;
  content = content.replace(oldInitLS, newInitLS);

  // Re-write STUN server ultra-compat into pConfStr (replacing turn relay)
  const replacePconf = /const pConf = \{[\s\S]*?\}\s*};\s*S\.peer = new Peer\([^)]*\);/g;
  
  const ultraPconf = `  const pConf = {
    config: {
      'iceServers': [
        { url: 'stun:stun.l.google.com:19302', urls: 'stun:stun.l.google.com:19302' },
        { url: 'stun:global.stun.twilio.com:3478?transport=udp', urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
      ]
    }
  };`;

  content = content.replace(/const pConf = \{[\s\S]*?\}\s*};\s*S\.peer = new Peer\(pConf\);/g, ultraPconf + "\n  S.peer = new Peer(pConf);");
  content = content.replace(/const pConf = \{[\s\S]*?\}\s*};\s*S\.peer = new Peer\(hostId, pConf\);/g, ultraPconf + "\n  S.peer = new Peer(hostId, pConf);");

  fs.writeFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', content);
  console.log("LocalStorage patch successfully applied!");

} catch(e) { console.log(e); }
