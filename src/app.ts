import * as Express from "express";
import * as MongoInterface from "./Database";
import * as Passport from "passport";
import * as BodyParser from "body-parser";
import {Strategy as LocalStrategy} from "passport-local";

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
const APIServer = Express();

// Connect to the MongoDB Server
const categoriesDatabase = new MongoInterface.Database(catDBConfig.url, catDBConfig.databaseName, catDBConfig.userName, catDBConfig.password);

// Accept JSON encoded bodies.
APIServer.use(BodyParser.json());
// Accept url encoded bodies.
APIServer.use(BodyParser.urlencoded({ extended: true }));
// Set up server plugins and allow CORS
// Additionally allow delete and patch methods.
APIServer.use(
  function crossOrigin(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH');
    return next();
  }
);

// Initializes the authentication middleware.
APIServer.use(Passport.initialize());
APIServer.use(Passport.session());

// Configure the local strategy for use.
// Passport.use(new LocalStrategy(More to come soon!));

// Set the base route for the database operations.
APIServer.route('/categories/')
  // List all of the categories in the database.
  .get((req, res) => {
    const dbReadResults = categoriesDatabase.read(catDBConfig.collection, {});
    dbReadResults.then((readResults) => {
      res.send(readResults);
      console.log("List all categories!");
    });
  })

  // Add a new category to the database.
  .post((req, res) => {
    const dbWriteResults = categoriesDatabase.write(catDBConfig.collection, [req.body]);
    dbWriteResults.then((results) => {
      res.send(results);
      console.log("Created new category!");
    });
  })

  // Delete a category from the DB.
  .delete((req, res) => {
    const dbDeleteResults = categoriesDatabase.delete(catDBConfig.collection, req.body.id);
    dbDeleteResults.then((results) => {
      res.send(results);
      console.log("Deleted a category!");
    });
  })

  // Update a category in the database.
  .patch((req, res, next) => {
    const dbUpdateResults = categoriesDatabase.update(catDBConfig.collection, req.body.id, req.body.updateOperation);
    dbUpdateResults.then((results) => {
      res.send(results);
      console.log("Updated a category!");
    });
  });

// Start API APIServer.
APIServer.listen(ServerConfig.APIPort, () => {
  console.log("Server running...");
});