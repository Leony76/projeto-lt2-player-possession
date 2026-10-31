import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import AuthRoutes from "./modules/auth/auth.routes.js";
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(cors({
  origin      : process.env["FRONTEND_URL"],
  credentials : true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", AuthRoutes);

app.use(errorMiddleware);

export default app;