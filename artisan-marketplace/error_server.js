import http from 'http';

const server = http.createServer((req, res) => {
  // Add CORS headers so the browser allows the request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url.startsWith('/?error=')) {
    const params = new URLSearchParams(req.url.slice(2));
    console.log("\n==================== FRONTEND ERROR ====================");
    console.log("Message:", params.get('error'));
    console.log("Stack:", params.get('stack'));
    console.log("========================================================\n");
  } else if (req.url.startsWith('/?unhandled=')) {
    const params = new URLSearchParams(req.url.slice(2));
    console.log("\n================ FRONTEND UNHANDLED REJECTION ================");
    console.log("Reason:", params.get('unhandled'));
    console.log("============================================================\n");
  } else if (req.url.startsWith('/?log=')) {
    const params = new URLSearchParams(req.url.slice(2));
    console.log(`[USER BROWSER LOG]: ${params.get('log')}`);
  }
  
  res.writeHead(200);
  res.end('ok');
});

server.listen(3333, () => {
  console.log("Error capture server listening on port 3333...");
});
