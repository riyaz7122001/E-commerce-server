const User = require("../models/user");
const Order = require("../models/order");

exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    // handling error...
    if (err || !user) {
      return res.status(400).json({
        error: "User cannot be found in MongDB...",
      });
    }
    // if no error...
    req.profile = user;
    next();
  });
};

exports.getUser = (req, res) => {
  // we have to show all the data that we have fetch instead salt and encry_password...
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  req.profile.createdAt = undefined;
  req.profile.updatedAt = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true, useFindAndModify: false },
    (err, user) => {
      if (err) {
        return res.status(403).json({
          error: "You cannot update user..",
        });
      }
      user.salt = undefined;
      user.createdAt = undefined;
      user.encry_password = undefined;
      user.updatedAt = undefined;
      res.json(user);
    }
  );
};

exports.userPurchaseList = (req, res) => {
  // populating the  orders details we are pulling the orders details...
  Order.find({ user: req.profile._id })
    .populate("user", "_id name")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "NO order in this account",
        });
      }
      // all the details of orders will be given in response..
      return res.json(order);
    });
};

exports.pushOrderInPurchaseList = (req, res, next) => {
  // here we are pushing details into purchase...
  let purchases = [];
  req.body.Order.products.forEach((product) => {
    purchases.push({
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      quantity: product.quantity,
      amount: req.body.Order.amount,
      transaction_id: req.body.Order.transaction_id,
    });
  });

  // storing the order details in MongoDB...
  User.findOneAndUpdate(
    {
      _id: req.profile._id,
    },
    { $push: { purchases: purchases } },
    { new: true },
    (err, item) => {
      if (err) {
        return res.status(400).json({ error: "Unable to save purchase list" });
      }
      next();
    }
  );
};
