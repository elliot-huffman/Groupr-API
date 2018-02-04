// Import required modules
import * as MongoInterface from "./Database";
import { ObjectID } from "./Database";
import { HashPassword } from "./Security"
import { TestConfig } from "./Config";

//
// Database Tests
//

// Open a database connection.
var Database = new MongoInterface.Database(TestConfig.Host,TestConfig.DatabaseName, TestConfig.Port);

// Create a new user.
const NewUserResults = Database.newUser(TestConfig.NewUser.eMail, HashPassword(TestConfig.NewUser.Password));

// Update an existing user after the new user creation has completed.
const UpdateUserResults = new Promise((resolve, reject) => {
    // Execute after the new user has been created.
    NewUserResults.then((NewResults) => {
        // Build the data structure that the user profile should have.
        const Data = {
            DisplayName: TestConfig.NewUser.DisplayName,
            IsPremium: TestConfig.NewUser.IsPremium,
        }
        // Start the update operation.
        const updateResults = Database.updateUser(TestConfig.NewUser.eMail, Data);
        // Gather the results (or error) and report them.
        updateResults.then((results) =>{
            resolve(results);
        }).catch((error) => {
            reject(error);
        });
    });
});


// Closes the database connection and prints the results.
Promise.all([NewUserResults, UpdateUserResults]).then((results) => {
    console.log(results);
    Database.close();
}).catch((error) => {
    console.log(error);
    Database.close();
});