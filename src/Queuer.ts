import {QueuerConfig} from "./Config";
import * as MongoInterface from "./Database";

const Database = new MongoInterface.Database(QueuerConfig.Database.Host, QueuerConfig.Database.DatabaseName, QueuerConfig.Database.Port);

// Set the user onto a category.
function SelectCategory(CategoryID: MongoInterface.ObjectID) {
    // pass
}

// After a user joins a category, sort them into a queue.
function SortUser(UserID: MongoInterface.ObjectID) {
    // pass
}

// After a queue fills up, send the message or set the results to the user profile.
function FulfillQueue(QueueID: MongoInterface.ObjectID) {
    // pass
}
