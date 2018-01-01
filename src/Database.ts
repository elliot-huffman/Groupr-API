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
        // If the connection fails, throw the error.
        this.ConnectionSession = mongoDB.MongoClient.connect(this.URL);
        this.ConnectionSession.then((SuccessfulResults) => {
                self.DBSession = SuccessfulResults;
                self.DBInstance = SuccessfulResults.db(this.DB);
            });
        this.ConnectionSession.catch((errorResult) => {
            throw errorResult;
        });
    }

    // Read the database.
    // If using an ID, pass the id as a string, it will be auto converted for you.
    read(collection: string, query: queryStructure): Promise<Array<any>> {
        // allow "this" to be accessible from within anonymous functions.
        var self = this;

        // If the query has an "_id" field, check if it is a string and if it is, convert it to an ObjectID.
        if (query._id !== undefined && typeof query._id === "string") {
            // Convert the _ID to a mongoDB ObjectID type for the query.
            query._id = this.stringToObjectID(query._id);
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
            });
        });
    }

    // Write document(s) to a collection in the database.
    write(collection: string, documentArray: Array<Object>): Promise<mongoDB.InsertWriteOpResult> {
        // allow "this" to be accessible from within anonymous functions.
        var self = this;

        // Create a promise execute the request asynchronously.
        return new Promise((resolve, reject) => {
            // Only execute after the MongoDB interface has a connection to the server.
            self.ConnectionSession.then((results) => {

                // Initialize a collection instance for manipulation.
                const collectionInstance = self.DBInstance.collection(collection);

                // Insert the document array into the collection.
                collectionInstance.insertMany(documentArray, (error, creationResults) => {
                    // If there is an error, return that error to the promise and stop the execution.
                    if (error) reject(error);
                    // If there is no error, return the results of the document creation to the promise.
                    resolve(creationResults);
                }); 
            });
        });
    }

    // Delete a document by the ID of the document.
    delete(collection: string, _id: string|mongoDB.ObjectID): Promise<mongoDB.DeleteWriteOpResultObject> {
        // allow "this" to be accessible from within anonymous functions.
        var self = this;

        // Check if the _id is a string and if it is, convert it to an ObjectID.
        if (typeof _id === "string") {
            // Convert the _ID to a mongoDB ObjectID type for the query.
            _id = this.stringToObjectID(_id);
        }

        // Create a promise execute the request asynchronously.
        return new Promise((resolve, reject) => {
            // Only execute after the MongoDB interface has a connection to the server.
            self.ConnectionSession.then((results) => {

                // Initialize a collection instance for manipulation.
                const collectionInstance = self.DBInstance.collection(collection);

                // Run the delete operation on the collection for the document specified by its ID.
                collectionInstance.deleteOne({"_id": _id}, (error, deleteResults) => {
                    // If there is an error, return that error to the promise and stop the execution.
                    if (error) reject(error);
                    // If there is no error, return the results of the deletion to the promise.
                    resolve(deleteResults);
                });
            });
        });
    }

    // Update a document
    // Update operation definitions:
    // https://docs.mongodb.com/manual/reference/operator/update/
    update(collection: string, _id: string|mongoDB.ObjectID, updateOperation: Object): Promise<mongoDB.UpdateWriteOpResult> {
        // allow "this" to be accessible from within anonymous functions.
        var self = this;

        // Check if the _id is a string and if it is, convert it to an ObjectID.
        if (typeof _id === "string") {
            // Convert the _ID to a mongoDB ObjectID type for the query.
            _id = this.stringToObjectID(_id);
        }

        // Create a promise execute the request asynchronously.
        return new Promise((resolve, reject) => {
            // Only execute after the MongoDB interface has a connection to the server.
            self.ConnectionSession.then((results) => {

                // Initialize a collection instance for manipulation.
                const collectionInstance = self.DBInstance.collection(collection);

                // Run the update operation on the collection to find the document specified in the query and then run the specified operation.
                collectionInstance.updateOne({"_id": _id}, updateOperation, (error, updateResults) => {
                    // If there is an error, return that error to the promise and stop the execution.
                    if (error) reject(error);
                    // If there is no error, return the results of the update to the promise.
                    resolve(updateResults);
                });
            });
        });
    }

    // Close Session
    close(): Promise<void> {
        // Closes the database connection.
        // This is generally not needed and for proper connection and resource usage, this should not be invoked as the interface reuses connections.
        // This is just mostly here for the test script to exit after testing.
        return this.DBSession.close();
    }

    // Convert a string into an ObjectID for DB operations.
    stringToObjectID(IDString: string): mongoDB.ObjectID {
        return new mongoDB.ObjectID(IDString);
    }
}