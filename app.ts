import * as restify from "restify";
import * as mongoDB from "mongodb";

const APIServer = restify.createServer({
  name: 'Three Horsemen API Server',
  version: '1.0.0'
});

const ServerConfig = {
  APIPort: 8080,
  APIListenOn: "localhost",
  DBurl: "mongodb://localhost:27017",
  DBName: "API"
}

// MongoDB Write
const insertDocuments = (db, callback) => {
  // Get the documents collection
  const collection = db.collection('documents');
  // Insert some documents
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], (error, result) => {
    if (error) throw error;
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
}


// MongoDB Read
const findDocuments = (db, callback) => {
  // Get the documents collection
  const collection = db.collection('documents');
  // Find some documents
  collection.find({}).toArray((error, docs) => {
    if (error) throw error;
    console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
}


// MongoDB Main
mongoDB.connect(ServerConfig.DBurl, (error, clientInstance) => {
  if (error) throw error;
  console.log("Connected successfully to server");

  const db = clientInstance.db(ServerConfig.DBName);

  insertDocuments(db, () => {clientInstance.close()});
  findDocuments(db, () => {clientInstance.close()});
});


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