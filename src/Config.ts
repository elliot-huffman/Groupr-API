// Configures for the main app script.
export const AppConfig = {
    // Configure the settings for connecting to the categories database.
    Database: {
        // URL needed for connecting to the DB, starts with "mongodb://" and then has standard domain notation, e.g. "elliot-labs.com"
        Host: "localhost",
        // Name of the database to open after connected to the DB server.
        DatabaseName: "DataStorage",
        // Port number that the DB runs off of.
        Port: 27017,
        // Username for DB authentication.
        UserName: "blank",
        // Password for DB authentication.
        Password: "blank",
    },
  
    //Configure the API HTTP REST server
    APIServer: {
        Port: 8080,
        ListenOnIP: "localhost",
        ListenOnDomain: "example.com",
    },

    // This is a super secret key, it cannot leak without dire consequences.
    SessionConfig: {
        name: 'session',
        secret: "AgH!lWgr~=2|+B3,+MW?*Qg9)^g^mK{^+]8x<^N/5M>=R!ai(xYu2-lhp{f>q0+?",
    },
}

// Configures the Security script.
export const SecurityConfig = {
    // https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_options
    HashAlgorithm: "sha512",
}

// Configures the test script.
export const TestConfig = {
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
        DisplayName: "Elliot Huffman",
        eMail: "eHuffman@elliot-labs.com",
        Password: "qwerty",
        EventsAttended: "123",
        Ratings: [],
        IsPremium: true,
    },
}