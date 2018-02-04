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

// Start API APIServer with the port specified in the config.
APIServer.listen(AppConfig.APIServer.Port, () => {
  console.log("Server running...");
});