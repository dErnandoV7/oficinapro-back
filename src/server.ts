import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { routes } from "./routes";
import { errorHandler } from "./common/middlewares/errorMiddleware";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(routes);

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

const port = Number(process.env.PORT ?? 3030);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
