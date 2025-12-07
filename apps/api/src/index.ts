import express, { Request, Response } from 'express';
import { env } from './env';

const app = express();

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const port = env.PORT;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
