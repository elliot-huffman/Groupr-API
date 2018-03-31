import * as Mongoose from "mongoose";

// Simplify the ObjectID type for schema definitions.
const ObjectIDType = Mongoose.Schema.Types.ObjectId;

// Export type aliases for use in other script files.
export type ObjectID = Mongoose.Types.ObjectId;
export type DocumentType = Mongoose.Document;

// Define the user data structure
const UserSchema = new Mongoose.Schema({
    // User's email address, needs to be unique. Required.
    eMail: {type: String, unique: true, required: true},
    // User's password, it is required.
    Password: {type: String, required: true},
    // User's age. Used for analytics.
    // May be used for exclusive events.
    Age: Number,
    // User's gender. Used for analytics.
    // May be used for exclusive events.
    Gender: String,
    // User's first name. Used for analytics.
    // May be used for exclusive events/customization.
    FirstName: String,
    // User's event attendance. Used for analytics.
    // May be used for exclusive events.
    EventsAttended: Number,
    // Array of ratings of a user by other users.
    // Used for analytics and/or admin.
    Ratings: [{
        // User ID of the reviewing user.
        UserID: ObjectIDType,
        // Star rating from the reviewing user.
        Rating: Number,
        // Free form text from the reviewing user.
        Comment: String,
    }],
    // Identifier for a user to specify if they are premium.
    IsPremium: Boolean,
    // Identifies a user's permission level.
    // Sets the default permission level.
    PermissionLevel: {type: String, default: "User"},
});

// Define the category data structure.
const CategorySchema = new Mongoose.Schema({
    // Name of category
    Name: {type: String, required: true},
    // Long form description of a category.
    Description: {type: String, required: true},
    // Users that are currently subscribed to this category.
    Users: [ObjectIDType],
    // Number of points assigned to this category to weight, in favor, the probability of this category getting selected.
    GravityPoints: Number,
    // Events listed in an array that are a part of this category.
    // If events exist then no other children categories should exist.
    Events: [ObjectIDType],
    // Categories that are listed underneath this category in the pyramid of categories.
    // There should be no children listed if there are events present.
    Children: [ObjectIDType],
});

// Define the event data structure.
const EventSchema = new Mongoose.Schema({
    // Human friendly name.
    Name: {type: String, required: true},
    // Geo location.
    Location: {type: String, required: true},
    // Category that the event is listed underneath.
    Category: {type: ObjectIDType, required: true},
    // The owner(s) of the event is allowed to make changes to it.
    Owners: [{type: ObjectIDType, required: true}],
    // The number of people sent to this event from queues. Used for analytics and is mostly a placeholder for the future.
    Visits: Number,
    // An array of times in a single day (each entry is a day fo the week, e.g. [0] is sunday and [1] is monday).
    // The [n][0] is the start time in the day and the [n][1] is the stop time. where n is some day of the week.
    AvailableTimePeriods: [[Date, Date]],
    // Unavailable dates are days of the year that the event is unavailable (E.G. closed for holidays).
    UnavailableDates: [Date],
    // The max number of queues this event can have.
    MaxQueueCount: Number,
    // The maximum users that a single queue can hold.
    QueueMaxUserCount: Number,
    // A list of queues in an array for a event.
    CurrentQueues: [ObjectIDType],
    // Array of ratings of an event by users.
    // Used for analytics/admin.
    Ratings: [{
        // User ID of the reviewing user.
        UserID: ObjectIDType,
        // Star rating from the reviewing user.
        Rating: Number,
        // Free form text from the reviewing user.
        Comment: String,
    }],
    // Identifier for event to specify if it is premium.
    IsPremium: Boolean,
});

// Define the queue data structure.
const QueueSchema = new Mongoose.Schema({
    // Event that the queue is linked to.
    Event: {type: ObjectIDType, required: true},
    // Automatically populated by the creation script, this is tied to the event's QueueMaxUserCount setting.
    MaxUserCount: {type: Number, required: true},
    // An array of users that are currently in the queue.
    QueuedUsers: [ObjectIDType],
    // Not sure what to use this for. Maybe status querying. Just a placeholder right now.
    // Maybe write protecting the queue after it has been filled and sent off.
    Fulfilled: Boolean,
});

// Compile the schemas into models.
const UserModel = Mongoose.model('User', UserSchema);
const CategoryModel = Mongoose.model('Category', CategorySchema);
const EventModel = Mongoose.model('Event', EventSchema);
const QueueModel = Mongoose.model('Queue', QueueSchema);

export class Database {
    // Define the class properties.
    Host: string;
    Database: string;
    Port: number|string|undefined;
    User: string|undefined;
    Password: string|undefined;
    Session: Promise<typeof Mongoose>;

    // Set the initial settings when the class is instantiated.
    constructor(HostName: string, DB: string, PortNumber?: number, UserName?: string, PWD?: string) {
        // Gets the parameters and sets the class properties with them.
        this.Host = HostName;
        this.Database = DB;
        this.Port = PortNumber
        this.User = UserName;
        this.Password = PWD;

        // Set the base connection protocol.
        let connectionURL = "mongodb://";

        // Set the port URL syntax if the user specifies the port.
        this.Port = (typeof this.Port === "undefined") ? this.Port = "": this.Port = ":" + this.Port;

        // Add the username, password, host, port and database items to the base connection url.
        if (typeof this.User === "undefined" || typeof this.Password === "undefined") {
            connectionURL = connectionURL +  this.Host + this.Port + "/" + this.Database;
        } else {
            connectionURL = connectionURL + this.User + ":" + this.Password + "@" + this.Host + this.Port + "/" + this.Database;
        }

        // Connect to the database.
        this.Session =  Mongoose.connect(connectionURL);

        // Error check the connection.
        Mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    }

    /*

        Global section.

    */

    // Check the connection status and wait for connection to finish if still connecting.
    waitForConnection(): Promise<void> {
        // Create a new promise as this is most definitively an async function.
        return new Promise((resolve, reject) => {
            // only proceed if the connection is connected or connecting.
            if (Mongoose.connection.readyState === 1 || Mongoose.connection.readyState === 2) {
                // If the DB is still connecting, wait for the connection to complete.
                if (Mongoose.connection.readyState === 2) {
                    // Once the connection is complete, execute the specified code.
                    Mongoose.connection.once('open', function() {
                        // Resolve the promise!
                        resolve();
                    });
                }
                // If the database is already connected, proceed as follows:
                if (Mongoose.connection.readyState === 1) {
                    // Resolve the promise.
                    resolve();
                }
            } else {
                // Reject the promise if we do not support the specific connection mode.
                reject("Not connecting or connected!");
            }
        });
    }

    // TODO: Create the initial full random category at the top of the category pyramid.
    // Only creates the category if the initial category does not exist.
    // May need relocated to the constructor, will investigate.
    initialFullRandomCategory() {
        // pass
    }

    // Closes the database connection.
    close(): Promise<void> {
        // This is generally not needed and for proper connection and resource usage, this should not be invoked as the interface reuses connections.
        // This is just mostly here for the test script to exit after testing.
        return Mongoose.connection.close()
    }

    /*

        User section.

    */

    // Creates a new user
    createUser(email: string, password: string): Promise<Mongoose.Document> {
        return new Promise((resolve, reject) => {
            this.waitForConnection().then(() => {
                UserModel.findOne({eMail: email}, 'eMail', function (error, results) {
                    if (error) reject(error);
                    if (results === null) {
                        const Data = {
                            eMail: email,
                            Password: password,
                        }
                        const newUser = new UserModel(Data);
                        newUser.save((error, results) => {
                            if (error) reject(error);
                            resolve(results);
                        });
                    } else {
                        reject("eMail already exists!");
                    }
                });
            });
        });
    };

    // Delete a user account by the Object ID.
    removeUser(UserID: ObjectID): Promise<Mongoose.Document> {
        return new Promise((resolve, reject) => {
            // Wait for a database connection before executing the user deletion.
            this.waitForConnection().then(() => {
                UserModel.findByIdAndRemove(UserID, (error, deletedDocument) => {
                    // If any error occurs, reject the promise.
                    if (error) reject(error);
                    // Because a successful query can run and no results are found it will return null.
                    // Filter the deleted document so that null queries are rejected. Only resolve successful queries.
                    if (deletedDocument === null) {
                        // Reject null document.
                        reject(deletedDocument);
                    } else {
                        // Resolve successful document deletion.
                        resolve(deletedDocument);
                    }
                });
            });
        });
    }

    // Updates a specified user (provide an object ID).
    updateUser(email: string, Data: {
        eMail?: String,
        DisplayName?: String,
        Password?: String,
        EventsAttended?: Number,
    }): Promise<Mongoose.Document> {
        return new Promise((resolve, reject) => {
            this.waitForConnection().then(() => {
                if (email === undefined) {
                    reject("eMail is required!");
                } else {
                    const query = { eMail: email };
                    UserModel.findOne(query, 'eMail', (error, userModel: Mongoose.Document) => {
                        if (error) reject(error);
                        userModel.set(Data);
                        userModel.save((error, updateResults) => {
                            if (error) reject(error);
                            resolve(updateResults);
                        });
                    });
                }
            });
        });
    }

    // TODO: Change the permission level of a user.
    changeUserPermission(email: String, NewPermissionLevel: String) {
        // pass
    }

    // Returns a specific user by the eMail unique identifier.
    getUserByEmail(email: string): Promise<Mongoose.Document> {
        // Create a new async operation.
        return new Promise((resolve, reject) => {
            // Wait for the database connection to complete.
            this.waitForConnection().then(() => {
                // Create the query 
                const query = { eMail: email };
                // run the query
                UserModel.findOne(query, (error, user: Mongoose.Document) => {
                    // If there are no results, reject the promise.
                    if (user === null) reject("No user found!");
                    // If there is an error, also reject the promise.
                    if (error) reject(error);
                    // Otherwise, resolve the promise.
                    resolve(user);
                });
            });
        });
    }

    // Find a user by the user's ID.
    getUserByID(UserID: any): Promise<Mongoose.Document> {
        // Create an async operation.
        return new Promise((resolve, reject) => {
            // Wait for the database connection to complete.
            this.waitForConnection().then(() => {
                // Query the user database for a user document with a specific ID.
                UserModel.findById(UserID, (error, user: Mongoose.Document) => {
                    // If the user does not exist, reject the promise.
                    if (user === null) reject("No user found!");
                    // If there is an error, also reject the promise.
                    if (error) reject(error);
                    // Return the user document if successful.
                    resolve(user);
                })
            });
        });
    }

    /*

        Category section.

    */

    // TODO: Create a category.
    createCategory(ParentID: ObjectID) {
        // pass
    }

    // TODO: Change a category.
    updateCategory(CategoryID: ObjectID, data: Object) {
        // pass
    }

    // TODO: Remove a category.
    // If the category has any children, will assign to parent.
    // If children are events, will only move events to parent if parent has no other children.
    removeCategory(CategoryID: ObjectID) {
        // pass
    }

    // TODO: List all categories and their data.
    getAllCategories() {
        // pass
    }

    // TODO: Add a user to a category.
    addUserToCategory(CategoryID: ObjectID, UserID: ObjectID) {
        // pass
    }

    // TODO: Remove a user from a category.
    removeUserFromCategory(CategoryID: ObjectID, UserID: ObjectID) {
        // pass
    }

    /*

        Event section.

    */

    // TODO: Create an event.
    // Only one owner initially, can add more owners after the event is created.
    // Error check to see if there are already child categories before creating the event.
    createEvent(CategoryID: ObjectID, Name: String, Location: String, Owner: ObjectID) {
        // pass
    }

    // TODO: Remove an event.
    // Only owners/admins can remove events.
    removeEvent(EventID: ObjectID, UserID: ObjectID) {
        // pass
    }

    // TODO: List all events and their data.
    // This would only be used on the admin side of things.
    getAllEvents() {
        // pass
    }

    // TODO: Update and event.
    // Only owners/admins can update an event.
    updateEvent(EventID: ObjectID, UserID: ObjectID, data: Object) {
        // pass
    }

    /*

        Queue section.

    */

    // TODO: Create a queue.
    createQueue(EventID: ObjectID, QueueMaxUserCount: Number) {
        // pass
    }

    // TODO: Delete a queue.
    removeQueue(QueueID: ObjectID) {
        // pass
    }

    // TODO: List all queues and their data.
    // This would only be used on the admin side of things.
    getAllQueueStatuses() {
        // pass
    }

    // TODO: Add a user to a queue.
    addUserToQueue(QueueID: ObjectID, UserID: ObjectID) {
        // pass
    }

    // TODO: Get the que status after validating user membership.
    getQueueStatus(QueueID: ObjectID, UserID: ObjectID) {
        // pass
    }

    // TODO: Drop the user out of a queue.
    removeUserFromQueue(QueueID:ObjectID, UserID: ObjectID) {
        // pass
    }
}