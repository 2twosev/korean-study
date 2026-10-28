/* 预览服务器 —— 电脑与手机（同一 WiFi）都能访问
   用法：
     node serve.js             默认端口 8138，监听所有网卡
     node serve.js 9000        换端口
   启动后会打印本机地址与局域网地址，手机用局域网地址访问即可。 */
const http = require('http'), fs = require('fs'), path = require('path'), url = require('url');
const os = require('os');
const root = __dirname;
const port = Number(process.argv[2]) || 8138;

/* 列出本机局域网 IPv4（供手机访问） */
function lanAddresses() {
  const out = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const n of nets[name] || []) {
      if (n.family === 'IPv4' && !n.internal) out.push(n.address);
    }
  }
  return out;
}

http.createServer((req, res) => {
  let p = decodeURIComponent(url.parse(req.url).pathname);
  if (p === '/') p = '/index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403); res.end('403'); return; }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('404 Not Found'); return; }
    const ext = path.extname(f);
    const ct = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.md': 'text/plain; charset=utf-8',
      '.svg': 'image/svg+xml'
    }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'no-store' });
    res.end(d);
  });
}).listen(port, '0.0.0.0', () => {
  const lans = lanAddresses();
  console.log('');
  console.log('  韩语学习助手已启动');
  console.log('  ────────────────────────────────');
  console.log('  本机访问:   http://127.0.0.1:' + port + '/');
  lans.forEach(ip => console.log('  手机访问:   http://' + ip + ':' + port + '/   （需连同一个 WiFi）'));
  if (!lans.length) console.log('  未检测到局域网地址，请检查 WiFi 是否已连接');
  console.log('  ────────────────────────────────');
  console.log('  提示：手机端麦克风跟读需要 HTTPS，局域网 http 下浏览器会禁用麦克风。');
  console.log('');
});
