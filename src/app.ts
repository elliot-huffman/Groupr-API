import * as restify from "restify";
import * as MongoInterface from "./Database";

// Configure the settings for connecting to the categories database.
const catDBConfig = {
  // URL needed for connecting to the DB, starts with "mongodb://" and then has standard domain notation, e.g. "elliot-labs.com"
  url: "mongodb://localhost",
  // Port number that the DB runs off of.
  port: 27017,
  // Username for DB authentication.
  userName: "blank",
  // Password for DB authentication.
  password: "blank",
  // Name of the database to open after connected to the DB server.
  databaseName: "DataStorage",
  // Hard code the collection
  collection: "Categories",
}

//Configure the API HTTP REST server
const ServerConfig = {
  APIPort: 8080,
  APIListenOn: "localhost",
  DomainName: "example.com",
}

// Create the HTTP REST API server
const APIServer = restify.createServer({
  name: 'Three Horsemen API Server',
  version: '0.0.1',
});

// Connect to the MongoDB Server
const categoriesDatabase = new MongoInterface.Database(catDBConfig.url, catDBConfig.databaseName, catDBConfig.userName, catDBConfig.password);

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

// List all categories on the server
APIServer.get('/categories/', (req, res, next) => {
  const dbReadResults = categoriesDatabase.read(catDBConfig.collection, {});
  dbReadResults.then((readResults) => {
    res.send(readResults);
    return next();
  });
});

// Add a category to the server
APIServer.post('/categories/', (req, res, next) => {
  const dbWriteResults = categoriesDatabase.write(catDBConfig.collection,[req.body]);
  dbWriteResults.then((results) => {
    res.send(results);
    console.log("Created new category!");
    return next();
  });  
});

// Delete a category.
APIServer.post('/categories/delete/', (req, res, next) => {
  const dbDeleteResults = categoriesDatabase.delete(catDBConfig.collection, req.body.id);
  dbDeleteResults.then((results) => {
    res.send(results);
    return next();
  });
});

// Update a category.
APIServer.post('/categories/update/', (req, res, next) => {
  const dbUpdateResults = categoriesDatabase.update(catDBConfig.collection, req.body.id, req.body.updateOperation);
  dbUpdateResults.then((results) => {
    res.send(results);
    console.log("Updated a category!");
    return next();
  });  
});

// Start API APIServer.
APIServer.listen(ServerConfig.APIPort, ServerConfig.APIListenOn);
console.log("Server running...")