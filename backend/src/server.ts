import 'dotenv/config';
import express, { Application } from 'express';
import session from 'express-session';
import cors from 'cors';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import routes from './routes/index';
import './utils/passportConfig';
import passport from 'passport';

const {
  BACKEND_PORT = '8080',
  FRONTEND_ADDRESS = 'http://localhost:3000',
  FRONTEND_ADDRESSES = '',
  SESSION_SECRET = 'replace-me',
  PRODUCTION_STR = 'false',
  DB_URL = 'mongodb://db:27017/cfa',
} = process.env;

const isProduction = PRODUCTION_STR === 'true';
const configuredOrigins = [FRONTEND_ADDRESS, ...FRONTEND_ADDRESSES.split(',')]
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set(configuredOrigins);

const app = express();

mongoose
  .connect(DB_URL)
  .then(() => console.log("Connected to database: " + DB_URL))
  .catch((err: unknown) => {
    console.error(`Error: ${err}`);
    process.exit(1);
  });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);

      // In local development, allow frontend running on an alternate localhost port (e.g. 3001).
      if (!isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(
  session({
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    secret: SESSION_SECRET,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60,
    },
    store: MongoStore.create({
      mongoUrl: DB_URL,
      stringify: false,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Mount all API routes
app.use(routes);

app.listen(BACKEND_PORT, () => {
  console.log(`REST API listening on port ${BACKEND_PORT}`);
});
