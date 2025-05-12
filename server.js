import express from "express";
// import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
// import cookieParser from 'cookie-parser';

import usersRouter from './routers/users.js';
import { createError } from "./utils/errors.js";
import { connect2DB } from "./utils/db.js";

dotenv.config();

/* ------------ create application ------------ */
const app = express();

/* --------- initialize server -------- */
const startServer = async () => {
  try {
    /* --------- create a connection to DB -------- */
    await connect2DB();

    /* ---------------- middleware ---------------- */
    // app.use(cookieParser());
    app.use(cors({ origin: "http://localhost:5000", credentials: true}));
    // app.use(morgan("dev"));
    app.use(express.json());

    /* ------------------ routers ----------------- */
    app.use("/users", usersRouter);

    /* --------------- error handler -------------- */
    app.use((req, res, next) => {
      next(createError("Route not defined!", 404));
    });

    app.use((error, req, res, next) => {
      res.status(error.status || 500).json({ msg: error.message });
    });

    /* ------------------- port ------------------- */
    const port = process.env.PORT || 5001;
    app.listen(
      port,
      console.log(`🚀 Server is running on: http://localhost:${port}`)
    );
  } catch (error) {
    console.error("❌ Failed to start the server:", error.message);
    process.exit(1); // Exit the process with a failure code
  }
};

startServer();
