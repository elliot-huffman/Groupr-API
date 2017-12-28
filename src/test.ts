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
    query: {},
    updateOperationOptions: {$set: {hello: "world"} },
    newDocs: [{name: "Soccer"}, {name: "Swimming"}, {name: "Rollerblading"}, {name: "Rollerskating"}, {name: "Tennis"}, {name: "Racket ball"}, {name: "Pickle ball"}],
}

// Create container for collecting the output of the database test operations.
var testDBResults = <any>{};

// Build the connection URL.
var connectionURL = testDBSettings.url + ":" + testDBSettings.port;

// Open a database connection.
var database = new MongoInterface.Database(connectionURL, testDBSettings.databaseName, testDBSettings.userName, testDBSettings.password);

// Update an entry in the DB
var updateOperation = database.update(testDBSettings.collection, "5a43e0e252286015bc301ea5", testDBSettings.updateOperationOptions).then((results) => {
    // add the results of the read operation to an array in the results variable.
    testDBResults.updateResults = results;
});

// Delete from the DB
var deleteOperation = database.delete(testDBSettings.collection, "5a43e0e252286015bc301ea5").then((results) => {
    // add the results of the read operation to an array in the results variable.
    testDBResults.deleteResults = results;
});

// Write to the DB
var writeOperation = database.write(testDBSettings.collection, testDBSettings.newDocs).then((results) => {
    // add the results of the read operation to an array in the results variable.
    testDBResults.writeResults = results;
});

// Run the read operation on the reported ID.
var readOperation = database.read(testDBSettings.collection, testDBSettings.query).then((results) => {
    // add the results of the read operation to an array in the results variable.
    testDBResults.readResults = results;
});

// only execute after all of the other promises have completed.
// Closes the DB connection and tucks the program in for bed. ZZZzzzzz.....
Promise.all([readOperation, writeOperation, updateOperation, deleteOperation]).then(() => {
    database.close().then((results)=>{
        testDBResults.closeResults = results;
    }).then(() => {
        console.log(testDBResults);
    });
});