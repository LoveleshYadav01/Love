const fs = require('fs');
try {
  let content = fs.readFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', 'utf-8');
  content = content.replace(/\r\n/g, '\n');

  // 1. Add nmod modal in HTML
  // Locate the end of dmod
  const nmodHTML = `
    <!-- NAME MODAL -->
    <div class="modc" id="nmod">
      <div class="modb" style="width:300px;text-align:center;padding:30px">
        <div style="font-family:'Playfair Display',serif;font-size:22px;margin-bottom:10px;color:var(--rd)">💕 Connected!</div>
        <p style="font-size:13px;color:var(--mu);margin-bottom:20px">Please enter your name to join the chat.</p>
        <input type="text" class="ii" id="cname" placeholder="Your Name..." style="margin-bottom:16px;width:100%" onkeypress="if(event.key==='Enter')joinChat()"/>
        <button class="btn btnp" style="width:100%;justify-content:center" onclick="joinChat()">Start Chatting</button>
      </div>
    </div>
    <!-- Footer -->`;
  content = content.replace('    <!-- Footer -->', nmodHTML);

  // 2. Remove lname from lview and INIT
  content = content.replace(/<div class="ig"><label>Your Name<\/label><input type="text" class="ii" id="lname" placeholder="Your Name\.\.\." \/><\/div>\s*\n/, '');
  content = content.replace(/document\.getElementById\('lname'\)\.value = d\.name \|\| '';\s*\n/, '');

  // 3. Update getSHA
  const oldGetSHA = `async function getSHA(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}`;
  const newGetSHA = `async function getSHA(str) {
  if (crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  } else {
    // Fallback for non-HTTPS local networks
    return btoa(unescape(encodeURIComponent(str))).replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 16);
  }
}`;
  content = content.replace(oldGetSHA, newGetSHA);

  // 4. Update doAuth to remove name checks
  const oldDoAuth = `async function doAuth(){
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
  
  S.loggedIn=true;S.loginName=name;`;

  const newDoAuth = `async function doAuth(){
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
  
  S.loggedIn=false; // Set logged in after name is provided`;
  content = content.replace(oldDoAuth, newDoAuth);

  // 5. Update setupConn to show name modal if no name
  const oldSetupConn = `function setupConn(conn) {
  S.conn = conn;
  document.getElementById('p2p-stat').textContent = "(Connected 💕)";`;
  
  const newSetupConn = `function joinChat() {
  const nm = document.getElementById('cname').value.trim();
  if(!nm) return;
  S.loginName = nm;
  S.loggedIn = true;
  document.getElementById('nmod').classList.remove('on');
  
  const savedAcc = localStorage.getItem('akakan_saved_account');
  if (savedAcc) {
     try {
       const d = JSON.parse(savedAcc);
       d.name = nm;
       localStorage.setItem('akakan_saved_account', JSON.stringify(d));
     } catch(e){}
  }
}

function setupConn(conn) {
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
  }
  if (!S.loginName) {
     document.getElementById('nmod').classList.add('on');
     setTimeout(()=>document.getElementById('cname').focus(), 100);
  }

  document.getElementById('p2p-stat').textContent = "(Connected 💕)";`;
  content = content.replace(oldSetupConn, newSetupConn);

  fs.writeFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', content);
  console.log("Patch name successfully applied!");
} catch (e) {
  console.log("Error patch name: " + e.message);
}
