// src/index.ts
import express, { ErrorRequestHandler } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { config } from 'dotenv';
config();
import categoriesRoutes from './routes/categoriesRoutes';


const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://pern-stack-by-lfc.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(morgan('dev'));

app.use(express.json());

app.use(categoriesRoutes);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json({ message: err.message });
};
app.use(errorHandler);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
