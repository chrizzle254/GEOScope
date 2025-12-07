import express from 'express';
import { env } from './env';
const app = express();
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
const port = env.PORT;
app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
});
