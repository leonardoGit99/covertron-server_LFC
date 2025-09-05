// src/index.ts
import express, { ErrorRequestHandler } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { config } from 'dotenv';
config();
import routes from './routes';
import cookieParser from 'cookie-parser';


const app = express();
const allowedOrigins = [
  'http://localhost:3000',
  'https://covertron.vercel.app'
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

app.use(cookieParser()); // To read cookies in protected routes

app.use('/api', routes);


const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json({ message: err.message });
};
app.use(errorHandler);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
