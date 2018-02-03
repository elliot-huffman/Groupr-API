// Import required modules
import * as MongoInterface from "./Database";
import { ObjectID } from "./Database";

//
// Database Tests
//

// Database connection settings.
var testDBSettings = {
    // URL needed for connecting to the DB, starts with "mongodb://" and then has standard domain notation, e.g. "elliot-labs.com"
    Host: "localhost",
    // Name of the database to open after connected to the DB server.
    DatabaseName: "test",
    // Port number that the DB runs off of.
    Port: 27017,
    // Username for DB authentication.
    UserName: "blank",
    // Password for DB authentication.
    Password: "blank",
    // definitions of new documents to create.
    NewUser: {
        DisplayName: "Elliot",
        eMail: "eHuffman@elliot-labs.com",
        Password: "qwerty",
        EventsAttended: "123",
        Ratings: [],
        IsPremium: true,
    },
}

// process.on('unhandledRejection', (reason, p) => {
//     console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
//     // application specific logging, throwing an error, or other logic here
// });

// Create container for collecting the output of the database test operations.
var testDBResults = <any>{};

// Open a database connection.
var database = new MongoInterface.Database(testDBSettings.Host,testDBSettings.DatabaseName, testDBSettings.Port);

const NewUserResults = database.newUser(testDBSettings.NewUser.eMail,testDBSettings.NewUser.Password);

const UpdateUserResults = new Promise((resolve, reject) => {
    NewUserResults.then((NewResults) => {
        const Data = {
            DisplayName: testDBSettings.NewUser.DisplayName,
            IsPremium: testDBSettings.NewUser.IsPremium,
        }
        const updateResults = database.updateUser(testDBSettings.NewUser.eMail, Data);
        updateResults.then((results) => {
            resolve(results);
        }).catch((error) => {
            reject(error);
        });
    });
});


// Closes the database connection.
Promise.all([NewUserResults, UpdateUserResults]).then((results) => {
    console.log(results);
    database.close();
}).catch((error) => {
    console.log(error);
    database.close();
});