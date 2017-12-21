import * as restify from "restify";
import * as mongoDB from "mongodb";

const server = restify.createServer({
  name: 'Three Horsemen API Server',
  version: '1.0.0'
});
const serverSettings = {
  port: 8080,
  listenOn: "localhost"
}

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(
    function crossOrigin(req,res,next){
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      return next();
    }
  );

server.get('/', function (req, res, next) {
  console.log(next);
  res.send({ hello: 'world' });
  return next();
});

server.get('/activities/:categories', function (req, res, next) {
  res.send(req.params);
  return next();
});

server.get('/activities/:categories/:activity', function (req, res, next) {
  res.send(req.params);
  return next();
});

server.listen(serverSettings.port, serverSettings.listenOn);