import * as restify from "restify";
import * as Database from "./Database";

const APIServer = restify.createServer({
  name: 'Three Horsemen API Server',
  version: '0.0.1',
});

const ServerConfig = {
  APIPort: 8080,
  APIListenOn: "localhost",
}

// Set up server plugins and allow CORS
APIServer.use(restify.plugins.acceptParser(APIServer.acceptable));
APIServer.use(restify.plugins.queryParser());
APIServer.use(restify.plugins.bodyParser());
APIServer.use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  }
);

// Create a new get URL on the server
APIServer.get('/', (req, res, next) => {
  console.log(next);
  res.send({ hello: 'world' });
  return next();
});

// Create a new get URL on the server
APIServer.get('/activities/:categories', (req, res, next) => {
  res.send(req.params);
  return next();
});

// Create a new get URL on the server
APIServer.get('/activities/:categories/:activity', (req, res, next) => {
  res.send(req.params);
  return next();
});

// Start API APIServer.
APIServer.listen(ServerConfig.APIPort, ServerConfig.APIListenOn);
console.log("Server running...")