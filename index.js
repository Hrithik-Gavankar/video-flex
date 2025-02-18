import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.listen(3000, () => {
  console.log("App is running on port 3000");
});
