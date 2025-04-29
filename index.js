import express from "express";
import  router  from "./routes/router.js";
import cors from "cors";
import { DBConnect } from "./utils/db.js";
import { configDotenv } from "dotenv";

configDotenv()


export const app = express()

app.use(cors())
app.use(express.json())
app.use("/api", router)

DBConnect()