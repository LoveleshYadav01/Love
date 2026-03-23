const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacement = `function setupConn(conn) {
  S.conn = conn;
  document.getElementById('p2p-stat').textContent = "(Connected 💕)";
  document.getElementById('p2p-stat').style.color = 'var(--rd)';
  document.getElementById('btn-games').style.display = 'block';
  document.body.classList.add('fs-mode');
  showToast("💕 Connected to partner!");
  
  conn.on('data', data => {
    if(data.type === 'chat') {
      S.msgs.push({id:data.id, t:data.val, me:false, time:data.time, n:data.name});
      renderMsgs();
    } else if(data.type === 'media') {
      S.msgs.push({id:data.id, file:data.val, isVid:data.isVid, me:false, time:data.time, n:data.name});
      renderMsgs();
    } else if(data.type === 'game') {
      handleGameSync(data);
    } else if(data.type === 'chatAct' && data.act === 'del') {
      S.msgs = S.msgs.filter(m => m.id !== data.id);
      renderMsgs();
    }
  });
  
  conn.on('close', () => {
    showToast("Partner disconnected 💔");
    S.conn = null;
    document.getElementById('p2p-stat').textContent = "(Disconnected)";
    document.getElementById('p2p-stat').style.color = 'var(--mu)';
    document.getElementById('btn-games').style.display = 'none';
    document.body.classList.remove('fs-mode');
  });
}`;

const start = html.indexOf('function setupConn(conn) {');
const end = html.indexOf('function doLogout(){');

if(start !== -1 && end !== -1) {
  html = html.substring(0, start) + replacement + '\n\n' + html.substring(end);
  fs.writeFileSync('index.html', html);
  console.log('Fixed setupConn successfully!');
} else {
  console.error('Could not find boundaries.');
}
