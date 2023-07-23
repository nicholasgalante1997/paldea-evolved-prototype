import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
const pageString = '<html><body><div style="padding:1rem;font-family:system-ui;"><p>Paldea Evolved</p></div></body></html>';

app.use(cors());
app.get('/', (_req, res) => res.status(200).send(pageString));
app.get('/ping', (_req, res) => res.status(200).json({ service_name: 'paldea-evolved-ab-service' }));

export const server = createServer(app);
