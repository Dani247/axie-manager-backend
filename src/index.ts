import express from "express";
import cors from 'cors';
import { json } from 'body-parser';
import { setup, serve } from "swagger-ui-express";
import { swaggerSpecs } from './utils/swaggerSpecs';

// import routes
import userRoutes from './routes/userRoutes';
import userScholarsRoutes from './routes/userScholars';

// dotenv
require('dotenv').config()
const PORT = process.env["PORT"];

// initialize app
const app = express();
app.use(cors());
app.use(json());

// swagger doc
app.use(
  "/api-docs",
  serve,
  setup(swaggerSpecs(), { explorer: true })
);

// use routes
app.use("/auth", userRoutes);
app.use("/scholars", userScholarsRoutes);

app.get("/hi", (req, res) => {
  res.send("hii");
})

// run server
app.listen(PORT, () => {
  console.log(`dauth running on port: ${PORT}`);
});
