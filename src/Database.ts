// WARNING, DATABASE OPERATIONS ARE ASYNCHRONOUS!!!
// Returns promises!
// Import the MongoDB driver
import * as mongoDB from "mongodb";

// Define the default structure for database queries.
// The _ID parameter si optional but when it is used, it will be a string.
interface queryStructure {
    _id?: string|mongoDB.ObjectID;
}

// Create the Database class.
export class Database {
    // Define the class properties.
    URL: string;
    DB: string;
    User: string;
    Password: string;
    ConnectionSession: Promise<mongoDB.Db>;
    DBSession: mongoDB.Db;
    DBInstance: mongoDB.Db;
    BoundConnectCallback: Function;


    // Set the initial settings when the class is instantiated.
    constructor(URL: string, DB: string, UserName: string, Password: string) {
        // Gets the parameters and sets the class properties with them.
        var self = this;
        this.URL = URL;
        this.DB = DB;
        this.User = UserName;
        this.Password = Password;

        // Since the connect method returns a promise, collect that promise and make it available.
        this.ConnectionSession = mongoDB.MongoClient.connect(this.URL);
        this.ConnectionSession.then(
            (SuccessfulResults) => {
                self.DBSession = SuccessfulResults;
                self.DBInstance = SuccessfulResults.db(this.DB);
            },
            (errorResult) => {
                throw errorResult;
            });
    }

    // Read the database.
    // If using an ID, pass the id as a string, it will be auto converted for you.
    read(collection: string, query: queryStructure) {
        // allow "this" to be accessible from within anonymous functions.
        var self = this;

        // If the query has an "_id" field, check if it is a string and if it is, convert it to an ObjectID.
        if (query._id !== undefined && typeof query._id === "string") {
            // Convert the _ID to a mongoDB ObjectID type for the query.
            query._id = new mongoDB.ObjectID(query._id);
        }

        // Create a promise execute the request asynchronously.
        return new Promise((resolve, reject) => {
            // Only execute after the MongoDB interface has a connection to the server.
            self.ConnectionSession.then((results) => {

                // Initialize a collection instance for manipulation.
                const collectionInstance = self.DBInstance.collection(collection);

                // Run the query on the collection to find the documents specified in the query.
                collectionInstance.find(query).toArray(function(error, searchResults) {
                    // If there is an error, return that error to the promise and stop the execution.
                    if (error) reject(error);
                    // If there is no error, return the results of the query to the promise.
                    resolve(searchResults);
                });
            },
            (error) => {
                // Spit out the error on the console for debugging if one occurs.
                console.log(error);
            });
        });
    }

    // Write to the database.
    write(collection: string, value: Object) {
        // allow "this" to be accessible from within anonymous functions.
        var self = this;
        // pass
        // return result;
    }

    // Update a document
    update(collection: string, query: string, value: Object) {
        // allow "this" to be accessible from within anonymous functions.
        var self = this;
        // pass
        // return result;
    }

    // Close Session
    close() {
        // Closes the database connection.
        // This is generally not needed and for proper connection and resource usage, this should not be invoked as the interface reuses connections.
        // This is just mostly here for the test script to exit after testing.
        this.DBSession.close();
    }
}