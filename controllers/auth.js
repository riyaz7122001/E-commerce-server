const User = require("../models/user");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { expressjwt: expressJwt } = require("express-jwt");

exports.signup = (req, res) => {
  // checking a validation for user errors from documentation..
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array()[0].msg });
  }

  // making a new user object...
  const user = new User(req.body);
  if (!user.name || !user.email || !user.password) {
    return res.status(400).json({
      error: "Please enter the fields",
    });
  }
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        message: "User not inserted..",
      });
    }
    res.status(200).json({
      name: user.name,
      email: user.email,
      id: user._id,
    });
    console.log("User inserted Sucessfully...");
  });
};

exports.signin = (req, res) => {
  // checking the email and password are correct or not...
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  // now checking if user already exists or not...
  User.findOne({ email }, (err, user) => {
    // if error it means use does not exists..
    if (err || !user) {
      return res.status(400).json({
        error: "user email does not exists",
      });
    }
    // if both condition does not match then we have to create a token...
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    // putting token into cookie ...
    res.cookie("token", token, { expire: new Date() + 9999 });
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Authentication failed",
      });
    }

    //after setting the cookie we are sending the response to frontend..
    const { _id, name, email, role } = user;
    res.json({
      token,
      user: {
        _id,
        name,
        email,
        role,
      },
    });
  });
};

exports.signout = (req, res) => {
  // clearing the cookie after clicking on signout button
  res.clearCookie("token");
  res.json({
    message: "user signout successfully..",
  });
};

// using a express-jwt package using doucumentation...
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});

// using middleware functions...

// custom middleware isAuthenticated function...
exports.isAuthenticated = (req, res, next) => {
  // here req.profile is taken from frontend and req.auth is taken from above isSignedIn middleware function...

  const checker = req.profile && req.auth && req.profile._id == req.auth._id;
  // if user does not matches then return error..
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

// custom middleware isAdmin function...
exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "Sorry you are not Admin...",
    });
  }
  next();
};
