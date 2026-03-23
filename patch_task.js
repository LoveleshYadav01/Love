const fs = require('fs');

try {
let content = fs.readFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', 'utf-8');

// Normalize to LF for easy replacing
content = content.replace(/\r\n/g, '\n');

// 1. CSS
const cssSearch = `    /* Fullscreen Mode */
    body.fs-mode .nav, 
    body.fs-mode #hero, 
    body.fs-mode #lgen, 
    body.fs-mode #smem, 
    body.fs-mode .sepdiv, 
    body.fs-mode .footer { display: none !important; }
    
    body.fs-mode { background: var(--bg); overflow: hidden; padding: 0; margin: 0; }
    body.fs-mode .app { padding: 0; max-width: 100%; }
    body.fs-mode #priv { padding-top: 0; margin-top: 0; min-height: 100vh; display: flex; flex-direction: column; }
    body.fs-mode .cs { height: 100vh; border-radius: 0; border: none; display: flex; flex-direction: column; box-shadow: none; margin: 0; }
    body.fs-mode .msgs { flex: 1; height: auto; max-height: none; border-radius: 0; }`;

const cssReplace = `    /* Fullscreen Mode */
    body.fs-mode .nav, 
    body.fs-mode #hero, 
    body.fs-mode #lgen, 
    body.fs-mode #smem, 
    body.fs-mode .sepdiv, 
    body.fs-mode .footer,
    body.fs-mode #priv .sechd { display: none !important; }
    
    body.fs-mode { background: var(--bg); overflow: hidden; padding: 0; margin: 0; }
    body.fs-mode .app { padding: 0; max-width: 100%; }
    body.fs-mode .pw { max-width: 100%; margin: 0; }
    body.fs-mode #priv { padding-top: 0; margin-top: 0; min-height: 100vh; display: flex; flex-direction: column; padding: 0; }
    body.fs-mode .cs { height: 100vh; border-radius: 0; border: none; display: flex; flex-direction: column; box-shadow: none; margin: 0; padding: 10px; }
    body.fs-mode .msgs { flex: 1; height: auto; max-height: none; border-radius: 0; }`;

content = content.replace(cssSearch, cssReplace);

// 2. Lview UI
const uiRegex = /<div id="lview">[\s\S]*?Hint: passphrase is "loveyou"<\/p>\s*<\/div>\s*<\/div>/;
const uiReplace = `<div id="lview">
          <div class="lc">
            <div class="li">🔐</div>
            <h3 id="auth-title">Enter Our Space</h3>
            <p id="auth-desc" style="color:var(--mu);font-size:13px;margin-bottom:20px;">Login to your space or create a new ID.</p>
            <div style="display:flex;gap:10px;justify-content:center;margin-bottom:16px;">
               <button class="btn btns" id="tab-login" onclick="setAuthTab('login')" style="border-color:var(--r);color:var(--r);background:var(--rl)">Login</button>
               <button class="btn btns" id="tab-signup" onclick="setAuthTab('signup')">Create ID</button>
            </div>
            <div id="lalert"></div>
            <div class="ig"><label>Your Name</label><input type="text" class="ii" id="lname" placeholder="Your Name..." /></div>
            <div class="ig"><label>Unique ID</label><input type="text" class="ii" id="lid" placeholder="Enter ID..." /></div>
            <div class="ig"><label>Secret Passphrase</label><input type="password" class="ii" id="lpass"
                placeholder="Enter passphrase..." onkeypress="if(event.key==='Enter')doAuth()" /></div>
            <button class="btn btnp" id="auth-btn" style="width:100%;justify-content:center;margin-top:6px" onclick="doAuth()">💕 Login</button>
          </div>
        </div>`;
content = content.replace(uiRegex, uiReplace);

// 3. doLogout replace
const logoutSearch = `                <button class="btn btns" onclick="doLogout()" style="font-size:12px;padding:7px 14px">🚪 Leave</button>`;
const logoutReplace = `                <button class="btn btns" onclick="deleteAccount()" style="font-size:12px;padding:7px 14px;border-color:#ff4d4d;color:#ff4d4d">🗑️ Delete ID</button>\n                <button class="btn btns" onclick="doLogout()" style="font-size:12px;padding:7px 14px">🚪 Leave</button>`;
content = content.replace(logoutSearch, logoutReplace);

// 4. doLogin JS
const jsRegex = /async function doLogin\(\)\{[\s\S]*?if\(err\.type === 'peer-unavailable'\) becomeHost\(hostId\);\s*\}\);\s*\}/;
const jsReplace = `function setAuthTab(t) {
  S.authMode = t;
  document.getElementById('tab-login').style.cssText = t === 'login' ? 'border-color:var(--r);color:var(--r);background:var(--rl)' : '';
  document.getElementById('tab-signup').style.cssText = t === 'signup' ? 'border-color:var(--r);color:var(--r);background:var(--rl)' : '';
  document.getElementById('auth-btn').innerHTML = t === 'login' ? '💕 Login' : '✨ Create ID';
  document.getElementById('auth-title').innerText = t === 'login' ? 'Enter Our Space' : 'Create New ID';
}

function deleteAccount() {
  if (confirm("Are you sure you want to delete your saved ID from this device?")) {
    localStorage.removeItem('akakan_saved_account');
    doLogout();
    document.getElementById('lid').value = '';
    document.getElementById('lpass').value = '';
    showToast("Account deleted from device.");
  }
}

async function doAuth(){
  const mode = S.authMode || 'login';
  const name=document.getElementById('lname').value.trim();
  const idStr=document.getElementById('lid').value.trim();
  const pass=document.getElementById('lpass').value;
  const al=document.getElementById('lalert');
  if(!name){al.innerHTML='<div class="ae">Please enter your name 💭</div>';return;}
  if(!idStr){al.innerHTML='<div class="ae">Unique ID required 💭</div>';return;}
  if(!pass){al.innerHTML='<div class="ae">Passphrase required 🔒</div>';return;}
  
  if (mode === 'signup') {
     localStorage.setItem('akakan_saved_account', JSON.stringify({ id: idStr, pass: pass, name: name }));
     showToast("Account Created & Saved!");
  }
  
  S.loggedIn=true;S.loginName=name;
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
content = content.replace(jsRegex, jsReplace);

// 5. INIT
const initSearch = `    ['br', 'co', 'sa'].forEach(k => updSliderBg(document.getElementById('sl-' + k)));`;
const initReplace = `    ['br', 'co', 'sa'].forEach(k => updSliderBg(document.getElementById('sl-' + k)));
    
    // Auth Init
    const savedAcc = localStorage.getItem('akakan_saved_account');
    if (savedAcc) {
      try {
        const d = JSON.parse(savedAcc);
        document.getElementById('lid').value = d.id || '';
        document.getElementById('lpass').value = d.pass || '';
        document.getElementById('lname').value = d.name || '';
      } catch(e){}
    }`;
content = content.replace(initSearch, initReplace);

fs.writeFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', content);
console.log("Patch successfully applied!");

} catch (e) {
  console.log("Error running patch: " + e.message);
}
