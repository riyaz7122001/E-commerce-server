const mongoose = require("mongoose");
// import crypto from "crypto";
// import { v4 as uuidv4 } from "uuid";
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    lastname: {
      type: String,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    userinfo: {
      type: String,
      trim: true,
    },
    encry_password: {
      type: String,
      required: true,
    },
    salt: String,
    role: {
      type: Number, // for example 1 for admin..
      default: 0,
    },
    purchases: { type: Array, default: [] },
  },
  { timestamps: true }
);

// here we are creating virtuals which will use to make another field which is not related to database, Schema in database it is encry_password..
userSchema
  .virtual("password")
  .set(function (password) {
    // taking the password in a variable..
    this._password = password; //by using this._password it's like we are making them private....
    this.salt = uuidv4(); //it will generate a unique id...
    this.encry_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

// here we are making schemas methods...
userSchema.methods = {
  // taking pasword and checking if it is equals to encry_password....
  authenticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },
  // taking password and checking if it is empty or not so making a securePassword function ...

  securePassword: function (plainpassword) {
    // if password is empty return ""
    if (!plainpassword) return "";
    // else encrypt the password..
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpassword)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema);
