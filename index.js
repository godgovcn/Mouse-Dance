const https = require('https');
const WebSocket = require('ws')
const fs = require('fs');
const keypath = process.cwd() + '/server.key';
const certpath = process.cwd() + '/server.crt';
const WebSocketServer = WebSocket.Server;
const crypto = require('crypto')
function md5(data) {
  let hash = crypto.createHash('md5');
  return hash.update(data).digest('hex');
}
var options = {
  key: fs.readFileSync(keypath),
  cert: fs.readFileSync(certpath),
};
var server = https.createServer(options, function (req, res) {//要是单纯的https连接的话就会返回这个东西
  res.writeHead(403);//403即可
  res.end("This is a  WebSockets server!\n");
}).listen(3000);

const wss = new ws.Server({ server: server })
var list = {}
var online = 0
wss.on('connection', function (ws) {
  var id;
  online++
  ws.on('message', function (message) {
    var data = JSON.parse(message)
    if (data.state == 'login') {
      id = md5(String(Date.now()))
      list[id] = {
        x: data.inf.x,
        y: data.inf.y,
        name: data.inf.name,
        msg: '',
        ws: ws
      }
      ws.send(JSON.stringify({
        state: 'login',
        id: id
      }))
      sedpush(id)
    }
    if (data.state == 'update') {
      list[data.inf.id].x = data.inf.x
      list[data.inf.id].y = data.inf.y
      list[data.inf.id].msg = data.inf.msg
      sedpush(id)
    }
  })
  ws.on('close', function () {
    delete list[id]
    online--
    sedpush(id)
  })
})
function sedpush(id) {
  var lists = {};
  for (var i in list) {
    lists[i] = {
      x: list[i].x,
      y: list[i].y,
      msg: list[i].msg,
      name: list[i].name,
    }
  }
  for (var i in list) {
    list[i].ws.send(JSON.stringify({
      state: 'push',
      data: lists,
      online: online
    }))
  }
}