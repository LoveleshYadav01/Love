const fs = require('fs');
try {
  let content = fs.readFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', 'utf-8');
  content = content.replace(/\r\n/g, '\n');

  const oldConn = `  S.peer.on('open', id => {
    const conn = S.peer.connect(hostId);
    conn.on('open', () => {
      S.isHost = false;
      setupConn(conn);
    });
  });`;

  const newConn = `  S.peer.on('open', id => {
    const conn = S.peer.connect(hostId);
    const tm = setTimeout(() => {
       if (!S.conn) {
          alert("Connection is taking too long!\\n\\nPossible reasons:\\n1. You are using Brave Browser on your phone (The Lion icon). Brave blocks WebRTC P2P connections to prevent IP leaks. Please turn off Brave Shields!\\n2. Your Network Firewalls are blocking P2P.\\n\\nTry switching off Brave Shields or connecting both devices to the same WiFi network!");
          document.getElementById('p2p-stat').textContent = "(Connection Failed ❌)";
       }
    }, 10000);
    conn.on('open', () => {
      clearTimeout(tm);
      S.isHost = false;
      setupConn(conn);
    });
  });`;
  
  content = content.replace(oldConn, newConn);

  fs.writeFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', content);
  console.log("Applied timeout patch!");

} catch(e) { console.log(e); }
