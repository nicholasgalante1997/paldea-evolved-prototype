import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

const app = express();

app.use(cors());

app.get('/ping', (_req, res) => res.status(200).json({ service_name: 'paldea-evolved-ab-service' }));

export const server = createServer(app);
