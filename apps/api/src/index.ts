import express, { Request, Response } from 'express';
import { env } from './env';
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const app = express();

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get("/users", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  res.json({ data, error });
  console.log({ data, error });
});

const port = env.PORT;

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log("Supabase URL:", env.SUPABASE_URL);
  console.log("Supabase Service Role Key:", env.SUPABASE_SERVICE_ROLE_KEY);
});
