// WARNING, DATABASE OPERATIONS ARE ASYNCHRONOUS!!!
// Returns promises!
// Import the MongoDB driver
import * as mongoDB from "mongodb";

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
    read(collection: string, query: Object) {
        var self = this;

        return new Promise((resolve, reject) => {
            self.ConnectionSession.then((results) => {

                const collectionInstance = self.DBInstance.collection(collection);

                collectionInstance.find(query).toArray(function(error, searchResults) {
                    if (error) reject(error);
                    resolve(searchResults);
                });
            },
            (error) => {
                console.log(error);
            });
        });
    }

    // Write to the database.
    write(collection: string, value: Object) {
        var self = this;
        // pass
        // return result;
    }

    // Update a document
    update(collection: string, query: string, value: Object) {
        var self = this;
        // pass
        // return result;
    }

    // Close Session
    close() {
        var self = this;
        // Closes the database connection.
        // This is generally not needed...
        this.DBSession.close();
    }
}