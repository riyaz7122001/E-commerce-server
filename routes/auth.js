const express = require("express");
const router = express.Router();
const { check, body, validationResult } = require("express-validator");
const { signout, signup, signin, isSignedIn } = require("../controllers/auth");

// in between we are using express-validator for validation...
router.post(
  "/signup",
  [
    check("name", "name should be of atleat 3 characters").isLength({ min: 3 }),
    check("email", "email is required").isEmail(),
    check("password", "password should be of atleast 3 characters").isLength({
      min: 3,
    }),
  ],
  signup
);
router.post(
  "/signin",
  [
    check("email", "email is required").isEmail(),
    check("password", "password field is required").isLength({
      min: 3,
    }),
  ],
  signin
);
router.get("/signout", signout);

// protected routes...
// router.get("/testroute", isSignedIn, (req, res) => {
//   res.send("A protected routes...");
// });

module.exports = router;
