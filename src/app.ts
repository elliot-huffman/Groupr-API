import * as Express from "express";
import * as ExpressSession from "express-session";
import * as ExpressFlash from "flash";
import * as BodyParser from "body-parser";
import * as Passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import * as SecurityInterface from "./Security";
import * as MongoInterface from "./Database";
import { AppConfig } from "./Config";

// Create the HTTP REST API server
const APIServer = Express();

// Connect to the MongoDB Server
const Database = new MongoInterface.Database(AppConfig.Database.Host, AppConfig.Database.DatabaseName, AppConfig.Database.Port);

// Accept JSON encoded bodies.
APIServer.use(BodyParser.json());
// Accept url encoded bodies.
APIServer.use(BodyParser.urlencoded({ extended: true }));
// Load the Express-Session addon for ExpressJS.
APIServer.use(ExpressSession(AppConfig.SessionConfig));
// Add flash support to the server.
APIServer.use(ExpressFlash());
// Initializes the authentication middleware.
APIServer.use(Passport.initialize());
APIServer.use(Passport.session());
// Set up server plugins and allow CORS.
// Additionally allow delete and patch methods.
APIServer.use(function crossOrigin(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH');
  res.header('Access-Control-Allow-Credentials', 'true');
  return next();
});

// Extracts the user's ID from the document that is passed to it (mongoose document)
Passport.serializeUser(function(user: any, done) {
  done(null, user._id);
});

// Returns a user document based upon the ObjectID specified.
Passport.deserializeUser(function(id, done) {
  Database.getUSerByID(id).then((user: MongoInterface.DocumentType): any => {
    done(null, user);
  }).catch((error) => {
    done(error);
  });
});

// Check the user log in status
// Redirect to the log in page if the user is not logged in.
var isAuthenticated = function (req:Express.Request, res:Express.Response, next:Express.NextFunction) {
  if (req.isAuthenticated())
    return next();
  res.redirect(AppConfig.UnauthenticatedRedirectPage);
}

// Define how users log in
Passport.use('login', new LocalStrategy(
  {passReqToCallback : true, usernameField: 'email', passwordField: 'password'},
  function(req, email, password, done) {
    let userLookup = Database.getUserByEmail(email);
    userLookup.then((results) => {
      if (!SecurityInterface.CompareHash(password, results.get('Password'))) {
        console.log("Invalid password!");
        return done(null, false, req.flash('message', 'Invalid password!'));
      }
      return done(null, results);
    });
    userLookup.catch((error) => {
      return done(null, false, req.flash('message', 'User not found :('))
    });
}));

/* Handle Logout */
APIServer.get('/logout', function(req, res) {
  req.logout();
  res.send("Logout Successful!");
});

/* GET Home Page */
APIServer.get('/protected', isAuthenticated, function(req, res){
  res.send("Protected data here...");
});

/* Handle Login POST */
APIServer.post('/login', Passport.authenticate('login'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.send("Logged in successfully!");
  }
);

/* Handle User Creation */
APIServer.post('/NewUser', function(req, res) {
  let results = Database.createUser(req.body.email, SecurityInterface.HashPassword(req.body.password));
  results.then((results) => {
    res.send(results);
  }).catch((results) => {
    res.send(results);
  });
});

// Start API APIServer with the port specified in the config.
APIServer.listen(AppConfig.APIServer.Port, () => {
  console.log("Server running...");
});