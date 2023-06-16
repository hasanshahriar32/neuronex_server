const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const UserRoute = require("./Routes/UserRoute");
const { notFound, errorHandler } = require("./MiddleWare/errMiddleWare");

// middleware
app.use(cors());
app.use(express.json());

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// routes start
app.get("/", (req, res) => {
  res.send("neuronex is running");
});
app.use("/user", UserRoute);
// routes end

app.use(notFound);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Neuronex is running: ${port}`);
});
