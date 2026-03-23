const fs = require('fs');

try {
  let content = fs.readFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', 'utf-8');
  content = content.replace(/\r\n/g, '\n');

  // 1. Update the Header in #cview to add #room-creds
  const startHeader = `<div style="font-size:11px;color:var(--mu)">Only you two can see this</div>
              </div>`;
  const replacementHeader = `<div style="font-size:11px;color:var(--mu)">Only you two can see this</div>
                <div id="room-creds" style="font-size:11.5px;color:var(--r);font-weight:bold;margin-top:6px;display:none;"></div>
              </div>`;
  content = content.replace(startHeader, replacementHeader);

  // 2. Hide Delete Button by default and add id
  const startDel = `<button class="btn btns" onclick="deleteAccount()" style="font-size:12px;padding:7px 14px;border-color:#ff4d4d;color:#ff4d4d">🗑️ Delete ID</button>`;
  const replaceDel = `<button class="btn btns" id="btn-del-acct" onclick="deleteAccount()" style="font-size:12px;padding:7px 14px;border-color:#ff4d4d;color:#ff4d4d;display:none;">🗑️ Delete</button>`;
  content = content.replace(startDel, replaceDel);

  // 3. Update getSHA to be robust non-crypto
  const oldSHA = /async function getSHA[\s\S]*?\}\s*\n/m;
  const newSHA = `async function getSHA(str) {
  // Use a completely uniform hash fallback so all devices perfectly match
  return btoa(unescape(encodeURIComponent(str))).replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 24);
}\n`;
  content = content.replace(oldSHA, newSHA);

  // 4. Update doAuth password trimming and logic
  const oldDoAuth = `async function doAuth(){
  const mode = S.authMode || 'login';
  const idStr=document.getElementById('lid').value.trim();
  const pass=document.getElementById('lpass').value;
  const al=document.getElementById('lalert');
  if(!idStr){al.innerHTML='<div class="ae">Unique ID required 💭</div>';return;}
  if(!pass){al.innerHTML='<div class="ae">Passphrase required 🔒</div>';return;}
  
  if (mode === 'signup') {
     // Name will be saved later when they join
     localStorage.setItem('akakan_saved_account', JSON.stringify({ id: idStr, pass: pass }));
     showToast("Account Created & Saved!");
  }
  
  S.loggedIn=false; // Set logged in after name is provided
  document.getElementById('lview').style.display='none';
  document.getElementById('cview').style.display='';
  
  const hash = await getSHA(idStr + pass);
  const hostId = 'akakan-' + hash.substring(0, 16) + '-host';
  
  S.msgs = []; // clear old msgs
  renderMsgs();
  
  S.peer = new Peer();
  S.peer.on('open', id => {
    const conn = S.peer.connect(hostId);
    conn.on('open', () => {
      S.isHost = false;
      setupConn(conn);
    });
  });
  S.peer.on('error', err => {
    if(err.type === 'peer-unavailable') becomeHost(hostId);
  });
}`;

  const newDoAuth = `async function doAuth(){
  const mode = S.authMode || 'login';
  const idStr=document.getElementById('lid').value.trim();
  const pass=document.getElementById('lpass').value.trim();
  const al=document.getElementById('lalert');
  if(!idStr){al.innerHTML='<div class="ae">Unique ID required 💭</div>';return;}
  if(!pass){al.innerHTML='<div class="ae">Passphrase required 🔒</div>';return;}
  
  const isPreviouslyCreator = !!localStorage.getItem('akakan_saved_account');
  const isCreatorMode = (mode === 'signup') || isPreviouslyCreator;
  
  if (mode === 'signup') {
     localStorage.setItem('akakan_saved_account', JSON.stringify({ id: idStr, pass: pass }));
     showToast("Account Created & Saved!");
  }
  
  if (isCreatorMode) {
      document.getElementById('btn-del-acct').style.display = 'block';
  } else {
      document.getElementById('btn-del-acct').style.display = 'none';
  }
  
  // Show Credentials on Chat Header
  document.getElementById('room-creds').innerHTML = \`ID: \${idStr} &nbsp;|&nbsp; Pass: \${pass}\`;
  document.getElementById('room-creds').style.display = 'block';
  
  S.loggedIn=false;
  document.getElementById('lview').style.display='none';
  document.getElementById('cview').style.display='';
  
  const hash = await getSHA(idStr + pass);
  const hostId = 'akakan-' + hash + '-host';
  
  S.msgs = [];
  renderMsgs();
  
  const pConf = { config: { 'iceServers': [ { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' } ] } };
  S.peer = new Peer(pConf);
  
  S.peer.on('open', id => {
    const conn = S.peer.connect(hostId);
    conn.on('open', () => {
      S.isHost = false;
      setupConn(conn);
    });
  });
  S.peer.on('error', err => {
    if(err.type === 'peer-unavailable') becomeHost(hostId);
  });
}`;
  content = content.replace(oldDoAuth, newDoAuth);

  // 5. Update becomeHost to inject the STUN config
  const oldBecomeHost = `function becomeHost(hostId) {
  S.peer.destroy();
  S.peer = new Peer(hostId);
  S.peer.on('open', id => {
    S.isHost = true;
    document.getElementById('p2p-stat').textContent = "(Waiting for partner...)";
  });
  S.peer.on('connection', conn => {
    if(S.conn) return; 
    conn.on('open', () => setupConn(conn));
  });
}`;

  const newBecomeHost = `function becomeHost(hostId) {
  S.peer.destroy();
  const pConf = { config: { 'iceServers': [ { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' } ] } };
  S.peer = new Peer(hostId, pConf);
  S.peer.on('open', id => {
    S.isHost = true;
    document.getElementById('p2p-stat').textContent = "(Waiting for partner...)";
  });
  S.peer.on('connection', conn => {
    if(S.conn) return; 
    if (conn.open) setupConn(conn);
    else conn.on('open', () => setupConn(conn));
  });
}`;
  content = content.replace(oldBecomeHost, newBecomeHost);

  fs.writeFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', content);
  console.log("Patch successfully applied!");

} catch(e) {
  console.log("Error logic: ", e.message);
}
