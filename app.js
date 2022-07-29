require("dotenv").config();
const express = require("express");
const connection = require("./database/db");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");

// middleware functions...
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//routes functions...
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);

// server starting...
const port = process.env.PORT;
app.listen(port, () => {
  // connection from database
  connection();
  console.log(`App is listening on ${port}...`);
});
