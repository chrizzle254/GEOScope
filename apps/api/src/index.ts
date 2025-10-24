import express, { Request, Response } from 'express';

const app = express();

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
