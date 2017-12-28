// Import required modules
import * as restify from "restify";
import * as MongoInterface from "./Database";

//
// Database Tests
//

// Database connection settings.
var testDBSettings = {
    url: "mongodb://localhost",
    port: 27017,
    userName: "blank",
    password: "blank",
    databaseName: "categories",
    collection: "indoors",
    query: { "_id": "5a43e0e252286015bc301ea5" },
}

// Build the connection URL.
var connectionURL = testDBSettings.url + ":" + testDBSettings.port;

// Open a database connection.
var database = new MongoInterface.Database(connectionURL, testDBSettings.databaseName, testDBSettings.userName, testDBSettings.password);

// Read the DB
var readResults = database.read(testDBSettings.collection, testDBSettings.query);

readResults.then((results) => {
    console.log(results);
    database.close();
    return true;
});