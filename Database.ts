// WARNING, DATABASE OPERATIONS ARE ASYNCHRONOUS!!!
// Import the MongoDB driver
import * as mongoDB from "mongodb";

// Create the Database class.
export class Database {
    // Define the class properties.
    URL: string;
    DB: string;
    User: string;
    Password: string;

    // Set the initial settings when the class is instantiated.
    constructor(URL: string, DB: string, UserName: string, Password: string) {
        // Gets the parameters
        this.URL = URL;
        this.DB = DB;
        this.User = UserName;
        this.Password = Password;
    }

    // Read the database.
    read(collection: string, query: Object, callback: Function) {
        // Create a server connection instance.
        var session = new mongoDB.MongoClient;

        // Connect the server connection instance
        session.connect(this.URL, (error: mongoDB.MongoError, connectionInstance: mongoDB.Db) => {
            // if there is an error on connecting, stop execution and print the results.
            if (error) throw error;

            // Open the specified database
            const db = connectionInstance.db(this.DB);

            // Get the documents collection
            const collectionInstance = db.collection(collection);
            // collectionInstance.find({'a': 3}).toArray(callback);

            // Close the connection to the server.
            connectionInstance.close();
        });
    }

    // Write to the database.
    write(collection: string, value: Object) {
        // pass
        // return result;
    }

    // Update a document
    update(collection: string, query: string, value: Object) {
        // pass
        // return result;
    }
}