import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const app = express();

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173"]
}));

app.use(express.json());ç

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.listen(8000, () => {
  console.log("App is running on port 8000");
});
