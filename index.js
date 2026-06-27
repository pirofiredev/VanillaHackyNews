import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: "http://127.0.0.1:5500" }));

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend" });
});

app.listen(3000, () => console.log("API on 3000"));
