import * as Mongoose from "mongoose";

// Simplify the ObjectID object.
const ObjectIDType = Mongoose.Schema.Types.ObjectId;
export const ObjectID = Mongoose.Types.ObjectId;

// Define the user data structure
const UserSchema = new Mongoose.Schema({
    eMail: {type: String, unique: true, required: true},
    Password: {type: String, required: true},
    DisplayName: String,
    EventsAttended: Number,
    Ratings: [{
        UserID: ObjectIDType,
        Rating: Number,
        Comment: String,
    }],
    IsPremium: Boolean,
});

// Define the category data structure
const CategorySchema = new Mongoose.Schema({
    Name: String,
    Parent: Boolean,
    Locations: [ObjectIDType],
    Children: [ObjectIDType],
});

// Define the location data structure
const LocationSchema = new Mongoose.Schema({
    Name: String,
    Location: String,
    Visits: Number,
    Ratings: [{
        UserID: ObjectIDType,
        Rating: Number,
        Comment: String,
    }],
    IsPremium: Boolean,
});

// Compile the schemas into models and export them.
const UserModel = Mongoose.model('User', UserSchema);
const CategoryModel = Mongoose.model('Category', CategorySchema);
const LocationModel = Mongoose.model('Location', LocationSchema);

export class Database {
    // Define the class properties.
    Host: string;
    Database: string;
    Port: number|string|undefined;
    User: string|undefined;
    Password: string|undefined;

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
        Mongoose.connect(connectionURL);

        // Error check the connection.
        Mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    }

    // Creates a new user
    newUser(email: string, password: string): Promise<Mongoose.Document> {
        return new Promise((resolve, reject) => {
            if (Mongoose.connection.readyState === 1 || Mongoose.connection.readyState === 2) {
                Mongoose.connection.once('open', function() {
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
            } else {
                reject("Database not connected or connecting!");
            }
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
            if (Mongoose.connection.readyState === 1 || Mongoose.connection.readyState === 2) {
                if (email === undefined) {
                    reject("Document ID is required!");
                } else {
                    const query = { eMail: email }
                    UserModel.findOne(query, 'eMail', (error, userModel: Mongoose.Document) => {
                        if (error) reject(error);
                        userModel.set(Data);
                        userModel.save((error, updateResults) => {
                            if (error) reject(error);
                            resolve(updateResults);
                        });
                    });
                }
            } else {
                reject("Database not connected or connecting!");
            }
        });
    }

    // Closes the database connection.
    close(): Promise<void> {
        // This is generally not needed and for proper connection and resource usage, this should not be invoked as the interface reuses connections.
        // This is just mostly here for the test script to exit after testing.
        return Mongoose.connection.close()
    }
}