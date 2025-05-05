import express from "express";
// import morgan from "morgan";
import dotenv from "dotenv";
// import cors from "cors";
// import cookieParser from 'cookie-parser';

// import usersRouter from './routers/users.js';
// import { createError } from "./utils/errors.js";
import { connect2DB } from "./utils/db.js";


dotenv.config();

/* ------------ create application ------------ */
const app = express();

/* --------- create a connection to DB -------- */
await connect2DB();

/* ---------------- middleware ---------------- */
// app.use(cookieParser());
// app.use(cors());
// app.use(morgan("dev"));
app.use(express.json());

/* ------------------ routers ----------------- */
// app.use("/users", usersRouter);


/* --------------- error handler -------------- */
app.use((req, res, next) => {
  next(createError("Route not defined!", 404));
});

app.use((error, req, res, next) => {
  if (error) res.status(error.status || 500).json({ msg: error.message });
  next();
});

/* ------------------- port ------------------- */
const port = process.env.PORT || 5001;
app.listen(
  port,
  console.log(`🚀 Server is running on: http://localhost:${port}`)
);
