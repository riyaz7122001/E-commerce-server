const mongoose = require("mongoose");

let connection = async () => {
  const conn = await mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  if (conn) {
    console.log(`MongoDB Connected...`);
  }
  if (!conn) {
    console.log(`MongoDB Disconnected...`);
  }
};
module.exports = connection;
