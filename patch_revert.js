const fs = require('fs');

try {
  let content = fs.readFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', 'utf-8');
  content = content.replace(/\r\n/g, '\n');

  // Replace connection setup
  const oldConn = `  S.peer.on('open', id => {
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

  const newConn = `  S.peer.on('open', id => {
    const conn = S.peer.connect(hostId);
    conn.on('open', () => {
      S.isHost = false;
      setupConn(conn);
    });
  });`;
  content = content.replace(oldConn, newConn);

  // Replace becomeHost
  const oldHost = `function becomeHost(hostId) {
  S.peer.destroy();
  S.peer = new Peer(hostId);
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

  const newHost = `function becomeHost(hostId) {
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
  content = content.replace(oldHost, newHost);

  fs.writeFileSync('c:\\Users\\madhu\\Downloads\\Love\\index.html', content);
  console.log("Reverted timeout and host logic.");
} catch(e) {
  console.log("Error patch revert: ", e);
}
