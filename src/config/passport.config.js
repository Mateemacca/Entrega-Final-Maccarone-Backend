import passport from "passport";
import local from "passport-local";
import { userModel } from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils/bcrypt.js";
import { Strategy as GithubStrategy } from "passport-github2";
import mongoose from "mongoose";
import CustomErrors from "../services/errors/CustomErrors.js";
import { userNotFound } from "../services/errors/info.js";
import config from "./config.js";
const ObjectId = mongoose.Types.ObjectId;

const LocalStrategy = local.Strategy;

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
          const user = await userModel.findOne({ email: username });
          if (user) {
            console.log("User already exists");
            return done(null, false);
          }
          const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
          };

          const result = await userModel.create(newUser);
          req.session.user = newUser;
          return done(null, result);
        } catch (error) {
          return done("Error finding user " + error);
        }
      }
    )
  );
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          if (
            username === config.adminName &&
            password === config.adminPassword
          ) {
            const adminUser = {
              email: config.adminName,
              role: "admin",
              first_name: "Administrator",
            };
            return done(null, adminUser);
          }

          const user = await userModel.findOne({ email: username });
          if (!user) {
            CustomErrors.createError({
              name: "User not found",
              cause: userNotFound(),
              message: "User not found",
              code: ErrorEnum.USER_NOT_FOUND,
            });
            return done(null, false);
          }
          if (!isValidPassword(user, password)) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: config.clientId,
        callbackURL: "http://localhost:8080/api/session/githubcallback",
        clientSecret: config.githubSecret,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userModel.findOne({ email: profile.username });
          if (!user) {
            const newUser = {
              first_name: profile._json.name.split(" ")[0],
              last_name: profile._json.name.split(" ")[1],
              age: 18,
              email: profile.username,
              password: "GithubGenerated",
            };
            const result = await userModel.create(newUser);
            return done(null, result);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    if (user && user.email === config.adminName) {
      done(null, new ObjectId("000000000000000000000000"));
    } else if (user && user._id) {
      done(null, user._id);
    } else {
      done(new Error("Invalid user"));
    }
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findOne({ _id: id });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

export default initializePassport;
