import {QueuerConfig} from "./Config";
import * as MongoInterface from "./Database";

// const Database = new MongoInterface.Database(QueuerConfig.Database.Host, QueuerConfig.Database.DatabaseName, QueuerConfig.Database.Port);

// Metadata for the TypeScript engine.
interface itemDefinition {
    id: MongoInterface.ObjectID,
    tokens: number,
}

// TODO
// Set the user onto a category.
function SelectCategory(UserID: MongoInterface.ObjectID, CategoryID: MongoInterface.ObjectID) {
    // pass
}

// TODO
// After a user joins a category, sort them into a queue.
function SortUser(CategoryID: MongoInterface.ObjectID) {
    // pass
}

// TODO
// After a queue fills up, send the message or set the results to the user profile.
function FulfillQueue(QueueID: MongoInterface.ObjectID) {
    // pass
}

// Builds the chances based upon the amount of tokens and randomly picks out a result.
function weightedRandom(inputObject: Array<itemDefinition>): Promise<MongoInterface.ObjectID> {
    // Create a new promise.
    return new Promise((resolve, reject) => {
        // Set up the variables for use.
        let result: MongoInterface.ObjectID;
        let table: Array<MongoInterface.ObjectID> = [];

        // Loop through all of the example data.
        for (let index = 0; index < inputObject.length; index++) {
            // Expose the example data and make it useable.
            const item = inputObject[index];
            // If no tokens exist, add the category to the table with no weight.
            if (item.tokens === undefined || item.tokens === 0) {
                // Add item ID to the table.
                table.push(item.id);
            } else {
                // For each token on the item, add a table entry for randomization.
                for (let tokenStep = 0; tokenStep < item.tokens; tokenStep++) {
                    // Take into account the token power by looping the add ID to table command.
                    for (let tokenPower = 0; tokenPower < QueuerConfig.TokenPower; tokenPower++) {
                        // Add the item to the randomization table.
                        table.push(item.id);
                    }           
                }
            }
        }
        // Generate a random number and modify the results to match the same length of the table.
        // After random number generation, round it to the nearest whole number.
        // Use that number as the selector for the table index.
        // Return the specified table index.
        resolve(table[Math.floor(Math.random() * table.length)]);
    });
}