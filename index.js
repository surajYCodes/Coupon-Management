import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Connect to DB
await connectDB();

app.use('/api_v1', routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
