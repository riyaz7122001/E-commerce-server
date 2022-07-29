const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
// for giving path to images and videos we have to use file system module it is inbuilt
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category", "name")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found",
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  // it is coming from documentation...
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  // it requires 3 parameters function fields and the files...
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image parsing error",
      });
    }

    // checking if fields are empty or not...
    const { name, description, price, category, stock } = fields;
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Please fill all the details",
      });
    }
    // restrictions of fields...
    let product = new Product(fields);
    if (files.photo) {
      if (files.photo.size > 5000000) {
        return res.status(400).json({
          error: "Image size if too big",
        });
      }
      // we are setting the file into database product..
      product.photo.data = fs.readFileSync(files.photo.filepath);
      product.photo.contentType = files.photo.mimetype;
    }

    // saving into db now.
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to store image in MongoDB",
        });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  // if photo is not loading so we can use this..
  req.product.photo = undefined;
  return res.json(req.product);
};

// middleware for photo...
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.status(req.product.photo.data);
  }
  next();
};

exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete the product",
      });
    }
    res.json({
      message: "Product Deleted Successfully",
      deletedProduct,
    });
  });
};

exports.updateProduct = (req, res) => {
  // it is coming from documentation...
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  // it requires 3 parameters function fields and the files...
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image parsing error",
      });
    }

    // getting the existing product and updating it..
    let product = req.product;
    product = _.extend(product, fields);

    if (files.photo) {
      if (files.photo.size > 5000000) {
        return res.status(400).json({
          error: "Image size if too big",
        });
      }
      // we are setting the file into database product..
      product.photo.data = fs.readFileSync(files.photo.filepath);
      product.photo.contentType = files.photo.mimetype;
    }

    // saving into db now.
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to update the product",
        });
      }
      res.json(product);
    });
  });
};

exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  //getting all the product
  Product.find()
    // we are using select so if what we want to show the details by using - it will not show that to user..
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      return res.json(product);
    });
};

// middleware for updating stock and sold in database mongoDB...
exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((prod) => {
    return {
      updateOne: {
        // finding the product..
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });

  // it is comig from documnetation..
  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk operations failed",
      });
    }
    next();
  });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: "NO categories found",
      });
    }
    res.json(category);
  });
};
