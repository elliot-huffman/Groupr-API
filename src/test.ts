// Import required modules
import * as MongoInterface from "./Database";

//
// Database Tests
//

// Database connection settings.
var testDBSettings = {
    // URL needed for connecting to the DB, starts with "mongodb://" and then has standard domain notation, e.g. "elliot-labs.com"
    url: "mongodb://localhost",
    // Port number that the DB runs off of.
    port: 27017,
    // Username for DB authentication.
    userName: "blank",
    // Password for DB authentication.
    password: "blank",
    // Name of the database to open after connected to the DB server.
    databaseName: "test",
    // Name the collection to be used.
    collection: "indoors",
    // Blank find all query, equivalent to "*" in standard regex.
    query: {},
    // Add key "hello" and value "world"
    updateOperationOptions: {$set: {hello: "world"} },
    // definitions of new documents to create.
    newDocs: [{name: "Soccer"}, {name: "Swimming"}, {name: "Rollerblading"}, {name: "Rollerskating"}, {name: "Tennis"}, {name: "Racket ball"}, {name: "Pickle ball"}],
    // Example string that needs converted to ObjectID
    string2ID: "5a4aaa46e3f0d4285cdd46c6",
}

// Create container for collecting the output of the database test operations.
var testDBResults = <any>{};

// Build the connection URL.
var connectionURL = testDBSettings.url + ":" + testDBSettings.port;

// Open a database connection.
var database = new MongoInterface.Database(connectionURL, testDBSettings.databaseName, testDBSettings.userName, testDBSettings.password);

// Write to the DB.
// After database operation execution has completed, store the results.
var writeOperation = database.write(testDBSettings.collection, testDBSettings.newDocs).then((results) => {
    // add the results of the read operation to an array in the results variable.
    testDBResults.writeResults = results;
});

// Update an entry in the DB.
var updateOperation = new Promise((resolve, reject) => {
    // Only execute after the write operation has completed.
    writeOperation.then((writeResults) => {
        let updateResults = database.update(testDBSettings.collection, testDBResults.writeResults.insertedIds[0], testDBSettings.updateOperationOptions).then((results) => {
                // add the results of the read operation to an array in the results variable.
                testDBResults.updateResults = results;
                // After successful execution, return the results to the promise.
                resolve(results);
            });
    });
});

// Run the read operation on the reported ID.
// Should return 7 database entries.
var preReadOperation = new Promise((resolve, reject) => {
    // Only execute after the Update Operation has completed.
    updateOperation.then((updateResults) => {
        // Run the read command on the database.
        let preReadResults = database.read(testDBSettings.collection, testDBSettings.query).then((results) => {
            // add the results of the read operation to an array in the results variable.
            testDBResults.preReadResults = results;
            // After successful execution, return the results to the promise.
            resolve(results);
        });
    })
});

// Delete ID from the DB that was modified by the update operation. Should leave 6 remaining entries.
var deleteOperation = new Promise((resolve, reject) => {
    // Only execute after the Pre Read Operation has completed.
    preReadOperation.then((preReadResults: any) => {

        // create a blank array.
        let deleteArray: Array<Promise<any>> = [];

        // Run a for loop on every entry that was created by the create command.
        for (const key in testDBResults.writeResults.insertedIds) {
            // only execute if the property exists.
            if (testDBResults.writeResults.insertedIds.hasOwnProperty(key)) {
                // Make the element available from the original object.
                const element = testDBResults.writeResults.insertedIds[key];
                // Execute a delete instance and assign it to the previously created array (deleteArray).
                deleteArray.push(database.delete(testDBSettings.collection, element));
            }
        }

        // Only send the finished signal after execution of all delete requests has finished.
        Promise.all(deleteArray).then((results) => {
            // After successful execution of all delete operations, return the results to the promise.
            resolve(results);
        });
    });
});

// Run the read operation on the reported ID.
// Should return no database entries.
var postReadOperation = new Promise((resolve, reject) => {
    // Only run after the delete operation has completed.
    deleteOperation.then((deleteResults) => {
        // Run a read command on the database.
        let postReadResults = database.read(testDBSettings.collection, testDBSettings.query).then((results) => {
            // add the results of the read operation to an array in the results variable.
            testDBResults.postReadResults = results;
            // After successful execution, return the results to the promise.
            resolve(results);
        });
    })
});

// Convert a string to an ObjectID
var string2ObjectIDOperation = new Promise((resolve, reject) => {
    // Convert a string to an object ID and store it in the results object.
    testDBResults.string2ObjectID = database.stringToObjectID(testDBSettings.string2ID);
    // After successful execution, return the results to the promise.
    resolve(testDBResults.string2ObjectID);
});

// Only execute after all of the other promises have been fulfilled.
// Closes the DB connection and tucks the program in for bed. ZZZzzzzz.....
Promise.all([writeOperation, updateOperation, preReadOperation, deleteOperation, postReadOperation, string2ObjectIDOperation]).then(() => {
    // Close the database connection.
    database.close().then((results) => {
        // Save the results to the DB Results variable.
        testDBResults.closeResults = results;
        // Print the results to the terminal for manual dissection of the results.
        console.log(testDBResults);
    });
});