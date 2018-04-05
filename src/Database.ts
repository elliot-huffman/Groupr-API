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

// Create user schema interface for use by the TypeScript engine to understand the custom data structure.
// This is essentially meta-data for the TypeScript engine.
interface UserSchema {
    eMail: string,
    Password: string,
    Age?: number,
    Gender?: string,
    FirstName?: string,
    EventsAttended?: number,
    Ratings?: [{
        UserID: ObjectID,
        Rating: number,
        Comment: string,
    }],
    IsPremium?: boolean,
    PermissionLevel: string,
}

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
    // Track which document is the parent.
    // This field is not needed for the UI but for a good reference on the back end to track the parent doc.
    ParentID: {type: ObjectIDType, required: true},
});

// Create category schema interface for use by the TypeScript engine to understand the custom data structure.
// This is essentially meta-data for the TypeScript engine.
interface CategorySchema {
    Name: string,
    Description: string,
    Users?: [ObjectID],
    GravityPoints?: Number,
    Events?: [ObjectID],
    Children?: [ObjectID],
    ParentID: ObjectID,
}

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

// Create event schema interface for use by the TypeScript engine to understand the custom data structure.
// This is essentially meta-data for the TypeScript engine.
interface EventSchema {
    Name: string,
    Location: string,
    Category: ObjectID,
    Owners: [ObjectID],
    Visits?: Number,
    AvailableTimePeriods?: [[Date, Date]],
    UnavailableDates?: [Date],
    MaxQueueCount?: Number,
    QueueMaxUserCount?: Number,
    CurrentQueues?: [ObjectID],
    Ratings?: [{
        UserID: ObjectID,
        Rating: number,
        Comment: string,
    }],
    IsPremium?: boolean,
}

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

// Create queue schema interface for use by the TypeScript engine to understand the custom data structure.
// This is essentially meta-data for the TypeScript engine.
interface QueueSchema {
    Event: ObjectID,
    MaxUserCount: number,
    QueuedUsers?: [ObjectID],
    Fulfilled?: Boolean,
}

// Define the data structure of the document models.
// This is also meta-data for the typescript compiler.
interface UserModel extends UserSchema, Mongoose.Document {}
interface CategoryModel extends CategorySchema, Mongoose.Document {}
interface EventModel extends EventSchema, Mongoose.Document {}
interface QueueModel extends QueueSchema, Mongoose.Document {}

// Compile the schemas into models.
const UserModel = Mongoose.model<UserModel>('User', UserSchema);
const CategoryModel = Mongoose.model<CategoryModel>('Category', CategorySchema);
const EventModel = Mongoose.model<EventModel>('Event', EventSchema);
const QueueModel = Mongoose.model<QueueModel>('Queue', QueueSchema);

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

    // Convert a string or a number to an ObjectID for use with mongoDB/Mongoose.
    convertToObjectID(IDInput: ObjectID | string | number): Promise<ObjectID> {
        // Create a new promise.
        return new Promise((resolve, reject) => {
            // If the input is a string or number, convert it.
            if (typeof IDInput === "number" || typeof IDInput === "string") {
                // Set up an error catcher for the string or number conversion.
                // Execute the code in the try block and catch any errors that happen instead of crashing the program.
                try {
                    // Convert the input into an ObjectID and store the results in a variable.
                    const IDOutput = Mongoose.Types.ObjectId(IDInput);
                    // Resolve the promise with the results of the conversion to ObjectID.
                    resolve(IDOutput);
                // If an error occurs, pass the error as the error parameter and execute the below code.
                } catch (error) {
                    // If there is an error in the conversion process, reject the promise with the error details.
                    reject(error);
                }
            // If it is already an object, pass it through without processing it.
            } else {
                // Resolve the promise with the ObjectID.
                resolve(IDInput);
            }
        });
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
        // Create a new promise.
        return new Promise((resolve, reject) => {
            // Wait for the database to connect before executing the user creation.
            this.waitForConnection().then(() => {
                // Run a search for an email address in the user database.
                UserModel.findOne({eMail: email}, 'eMail', function (error, results) {
                    // If an error occurs, reject the promise.
                    if (error) reject(error);
                    // If no results were found, create the user.
                    if (results === null) {
                        // Build the user's data structure.
                        const Data = {
                            eMail: email,
                            Password: password,
                        }
                        // Create a new user document.
                        const newUser = new UserModel(Data);
                        // Save the user's document.
                        newUser.save((error, results) => {
                            // If there is an error during the save, reject the promise.
                            if (error) reject(error);
                            // Otherwise resolve the promise with the results, a copy of the new user document.
                            resolve(results);
                        });
                    } else {
                        // If the email already exists in the database, reject the promise and provide the reason.
                        reject("eMail already exists!");
                    }
                });
            });
        });
    };

    // Delete a user account by the Object ID.
    removeUser(UserID: ObjectID | string | number): Promise<Mongoose.Document> {
        // Create a new promise.
        return new Promise((resolve, reject) => {
            // Wait for a database connection before executing the user deletion.
            this.waitForConnection().then(() => {
                // Run the user query and if a mach is found, delete it.
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
    updateUser(email: string, Data: UserSchema): Promise<Mongoose.Document> {
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

    // Create a category and link it to its parent.
    createCategory(ParentID: ObjectID | string | number, Name: string, Description: string): Promise<Mongoose.Document> {
        // Create a new promise.
        return new Promise((resolve, reject) => {
            // Wait for the database connection before creating the new category.
            this.waitForConnection().then(() => {
                // Convert the parameter to an Object ID if it is not already an object ID.
                this.convertToObjectID(ParentID).then((ParentIDConverted) => {
                    // Build the data structure for the new category.
                    const Data = {
                        Name: Name,
                        Description: Description,
                        ParentID: ParentID,
                    }
                    // Create the new category in memory with the specified data.
                    const newCategory = new CategoryModel(Data);
                    // Save the new category to disk.
                    newCategory.save((error, results) => {
                        // If there is an error during the save, reject the promise.
                        if (error) reject(error);
                        // Update the parent category to include the new category as a child category.
                        const parentResults = CategoryModel.findByIdAndUpdate(ParentIDConverted,{$push: {Children: results._id}});
                        // If there was an error, report it. It is not don't ask don't tell here.
                        parentResults.catch((error) => {
                            // Reject the promise and return the error.
                            reject(error);
                        });
                        // After the parent category has been successfully updates, execute the below.
                        parentResults.then(() => {
                            // Resolve the promise and return the results.
                            resolve(results);
                        });
                    });
                });                
            });
        });
    }

    // TODO: Change a category.
    updateCategory(CategoryID: ObjectID, data: Object) {
        // pass
    }

    // Delete a category.
    // If the category has any children, deny deletion.
    removeCategory(CategoryID: ObjectID | string | number): Promise<Mongoose.Document> {
        // Create a new promise.
        return new Promise((resolve, reject) => {
            // Wait for a database connection before executing the category deletion.
            this.waitForConnection().then(() => {
                // Check for the document before running the delete command.
                CategoryModel.findById(CategoryID).then((results) => {
                    // If there are no documents, reject the promise. Otherwise go ahead with the deletion process.
                    if (results === null) {
                        // Reject the promise.
                        reject("No document found!");
                    } else {
                        // Check if the category has any children. If it does, reject the promise and stop execution.
                        // Otherwise continue with the category deletion.
                        if (typeof results.Children !== 'undefined' && results.Children.length > 0) {
                            // Run the category query and if a mach is found, delete it.
                            CategoryModel.findByIdAndRemove(CategoryID, (error, deletedDocument) => {
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
                        } else {
                            // Reject the promise because the category has children.
                            reject("Can't delete, category has children: " + results.Children);
                        }
                    }
                });
            });
        });
    }

    // List all categories and their data.
    getAllCategories() {
        // Create a new promise.
        return new Promise((resolve, reject) => {
            // Wait for the database to connect.
            this.waitForConnection().then(() => {
                // Get all categories from the collection.
                CategoryModel.find({}).then((results) => {
                    // Resolve the promise with the results of the database query.
                    resolve(results);
                // If there is an error catch it.
                }).catch((error) => {
                    // Reject the promise with the details of the error.
                    reject(error);
                });
            });
        });
    }

    // Add a user to a category.
    addUserToCategory(CategoryID: ObjectID, UserID: ObjectID) {
        // Create a new promise.
        return new Promise((resolve, reject) => {
            // Wait for a database connection.
            this.waitForConnection().then(() => {
                // Find a category by its ID.
                CategoryModel.findById(CategoryID).then((results) => {
                    // If nothing is found, reject the promise.
                    if (results === null) {
                        // Reject the promise.
                        reject("No category found!");
                    // Otherwise process the script.
                    } else {
                        // If no users array is present, create one and populate the data.
                        if (results.Users === undefined) {
                            // Add the userID to the users array.
                            results.Users = [UserID];
                            // Save the modified document to the database.
                            // Store the promise that is returned from the save operation into a variable.
                            var internalPromise = results.save();
                        } else {
                            // Add the User ID to the existing array.
                            results.Users.push(UserID);
                            // Save the modified document from memory to disk.
                            // Store the promise that is returned from the save operation into a variable.
                            var internalPromise = results.save();
                        }
                        // Access the promise that was generated from saving the document.
                        internalPromise.then(() => {

                        });
                    }
                // Make a note on the user profile which category they are joined to.
                }).then(() => {
                    UserModel.findById(UserID).then((results) => {
                        if (results === null) {
                            reject("No User ID found");
                        } else {
                            
                        }
                    })
                });
            });
        });
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