import * as Express from "express";
import CookieSession = require('cookie-session');;
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
APIServer.use(CookieSession(AppConfig.SessionConfig));
// Initializes the authentication middleware.
APIServer.use(Passport.initialize());
APIServer.use(Passport.session());
// Set up server plugins and allow CORS.
// Additionally allow delete and patch methods.
APIServer.use(function crossOrigin(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH');
  return next();
});

Passport.serializeUser(function(user: any, done) {
  done(null, user._id);
});
 
Passport.deserializeUser(function(id, done) {
  MongoInterface.UserModel.findById(id, function(err, user: any) {
    done(err, user);
  });
});

Passport.use('login', new LocalStrategy({passReqToCallback : true}, function(req, email, password, done) { 
  // check in mongo if a user with username exists or not
  MongoInterface.UserModel.findOne({ eMail:  email }, function(err, user) {
      // In case of any error, return using the done method
      if (err) return done(err);
      // Username does not exist, log error & redirect back
      if (!user) {
        console.log('User Not Found with email address ' + email);
        return done(null, false, req.flash('message', 'User Not found.'));                 
      }
      // User exists but wrong password, log the error 
      if (!SecurityInterface.CompareHash(user.get('Password'), password)){
        console.log('Invalid Password');
        return done(null, false, req.flash('message', 'Invalid Password'));
      }
      // User and password both match, return user from 
      // done method which will be treated like success
      return done(null, user);
    }
  );
}));

// Start API APIServer with the port specified in the config.
APIServer.listen(AppConfig.APIServer.Port, () => {
  console.log("Server running...");
});