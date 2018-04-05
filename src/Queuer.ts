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

// Dump truck
function weightedRand(spec) {
    var i, j, table=[];
    for (i in spec) {
        // The constant 10 below should be computed based on the
        // weights in the spec for a correct and optimal table size.
        // E.g. the spec {0:0.999, 1:0.001} will break this impl.
        for (j=0; j<spec[i]*10; j++) {
        table.push(i);
        }
    }
    return function() {
        return table[Math.floor(Math.random() * table.length)];
    }
}
var rand012 = weightedRand({0:0.8, 1:0.1, 2:0.1});
rand012(); // random in distribution...

// race car
function weightedRand2(spec) {
    var i, sum=0, r=Math.random();
    for (i in spec) {
        sum += spec[i];
        if (r <= sum) return i;
    }
}
weightedRand2({0:0.8, 1:0.1, 2:0.1}); // random in distribution...