import {QueuerConfig} from "./Config";
import * as MongoInterface from "./Database";

const Database = new MongoInterface.Database(QueuerConfig.Database.Host, QueuerConfig.Database.DatabaseName, QueuerConfig.Database.Port);

// Set the user onto a category.
function SelectCategory(UserID: MongoInterface.ObjectID, CategoryID: MongoInterface.ObjectID) {
    // pass
}

// After a user joins a category, sort them into a queue.
function SortUser(CategoryID: MongoInterface.ObjectID) {
    // pass
}

// After a queue fills up, send the message or set the results to the user profile.
function FulfillQueue(QueueID: MongoInterface.ObjectID) {
    // pass
}

/* Data is in this format:

{
    "ObjectIDHereAsString": 0.5,
    "5349b4ddd2781d08c09890f4": 0.5,
}

// Value is the percentage chance of the property of being selected.
// All of the values have to add up to 1 for maximum performance with the weightedRandLight function.

*/

// Used for metadata in the TypeScript engine.
interface weightedRandomInput {
    [index: string]: number;
}

// Dump truck: Dor absolutely huge amounts of data, ?100,000+ entries?
// This weighted randomization algorithm is good for absolutely huge amounts of data and is not realistically needed.
function weightedRandHeavy(inputDef: weightedRandomInput): string {
    // Initializes the needed variables.
    let index: string;
    let table: Array<string> = [];
    // Run a loop on all of the properties of the object passed to the function.
    for (index in inputDef) {
        // The randomization precision below should be computed based on the weights in the inputDef for a correct and optimal table size.
        // E.g. the inputDef {0:0.999, 1:0.001} will break this impl. The precision will have to be 100 in this case.
        for (let counter = 0; counter < inputDef[index] * QueuerConfig.WeightedRandomizationPrecision; counter++) {
            // Add the index to the final table to be used.
            table.push(index);
        }
    }
    // Generate a random number and modify the results to match the same length of the table.
    // After random number generation, round it to the nearest whole number.
    // Use that number as the selector for the table index.
    // Return the specified table index.
    return table[Math.floor(Math.random() * table.length)];
}

// Race car: For smaller amounts of data. 10,000 entries has been tested safely.
// This weighted randomization algorithm is useful for everyday operations.
function weightedRandLight(inputDef: weightedRandomInput): string {
    // Define the index variable so it is useable.
    let index: string;
    // Create the sum variable and initialize its value to 0.
    let sum = 0;
    // Generate a random number for use as a reference point.
    let randomNumber = Math.random();

    // Run a loop on each item present in the object passed to the function.
    for (index in inputDef) {
        // Add the percentage chance to the current sum.
        sum += inputDef[index];
        // If the random number is lower or equal to the current sum, return index (the key property).
        if (randomNumber <= sum) return index;
    }

    // If no results were found, run again.
    return weightedRandLight(inputDef);
}