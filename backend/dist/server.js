"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const index_1 = __importDefault(require("./routes/index"));
require("./utils/passportConfig");
const passport_1 = __importDefault(require("passport"));
const { BACKEND_PORT = '8080', FRONTEND_ADDRESS = 'http://localhost:3000', FRONTEND_ADDRESSES = '', SESSION_SECRET = 'replace-me', PRODUCTION_STR = 'false', DB_URL = 'mongodb://db:27017/cfa', } = process.env;
const isProduction = PRODUCTION_STR === 'true';
const configuredOrigins = [FRONTEND_ADDRESS, ...FRONTEND_ADDRESSES.split(',')]
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedOrigins = new Set(configuredOrigins);
const app = (0, express_1.default)();
mongoose_1.default
    .connect(DB_URL)
    .then(() => console.log("Connected to database: " + DB_URL))
    .catch((err) => {
    console.error(`Error: ${err}`);
    process.exit(1);
});
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.has(origin))
            return callback(null, true);
        // In local development, allow frontend running on an alternate localhost port (e.g. 3001).
        if (!isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));
app.use((0, express_session_1.default)({
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
    store: connect_mongo_1.default.create({
        mongoUrl: DB_URL,
        stringify: false,
    }),
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Mount all API routes
app.use(index_1.default);
app.listen(BACKEND_PORT, () => {
    console.log(`REST API listening on port ${BACKEND_PORT}`);
});
