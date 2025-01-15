import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "path";
import favicon from "serve-favicon";
import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";

import IController from "./interfaces/controller.interface";
import errorMiddleware from "./middleware/error.middleware";
import swaggerDocument from "./swagger";

export default class App {
    public app: express.Application;
    public controllers: IController[];

    public constructor(controllers: IController[]) {
        // create express application:
        this.app = express();

        // Serve favicon.ico:
        try {
            this.app.use(favicon(path.join(__dirname, "../favicon.ico")));
        } catch (error) {
            console.log(error.message);
        }

        this.controllers = controllers;
    }

    // only use in tests
    public getServer(): express.Application {
        return this.app;
    }

    private initializeMiddlewares() {
        // Swagger
        const options: SwaggerUiOptions = {
            swaggerOptions: {
                // docExpansion: "list",
                displayRequestDuration: true,
                // defaultModelsExpandDepth: 3,
                // defaultModelExpandDepth: 3,
                tryItOutEnabled: true,
                // showCommonExtensions: true,
                // filter: true,
            },
        };
        this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

        this.app.use(express.json()); // body-parser middleware, for read requests body
        this.app.use(cookieParser()); // cookie-parser middleware, for read requests cookies

        // Enabled CORS (Cross-Origin Resource Sharing):
        this.app.use(
            cors({
                origin: [
                    "https://kek-frontend.vercel.app",
                    "https://kek-frontend-git-main-nits68s-projects.vercel.app",
                    "http://localhost:8080",
                    "http://127.0.0.1:8080",
                    "http://localhost:9000",
                    "http://127.0.0.1:9000",
                ],
                exposedHeaders: ["x-total-count"],
                credentials: true,
            }),
        );

        // Helmet helps secure Express apps by setting HTTP response headers.
        // https://helmetjs.github.io/
        this.app.use(helmet());

        // Rate limiting: https://github.com/express-rate-limit/express-rate-limit
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            limit: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes).
            standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
            message: "Too many requests from this IP, please try again after 15 minutes.",
            // store: ... , // Redis, Memcached, etc. See below.
        })
        
        // Apply the rate limiting middleware to all requests.
        this.app.use(limiter)

        this.app.set("trust proxy", 1); // trust first proxy (If you have your node.js behind a proxy and are using secure: true, you need to set "trust proxy" in express)

        // Session management:
        // https://javascript.plainenglish.io/session-management-in-a-nodejs-express-app-with-mongodb-19f52c392dad

        // session options for deployment:
        const mySessionOptions: session.SessionOptions = {
            secret: process.env.SESSION_SECRET,
            rolling: true,
            resave: false,
            saveUninitialized: false,
            cookie: { secure: true, httpOnly: true, sameSite: "none", maxAge: 1000 * 60 * +process.env.MAX_AGE_MIN },
            unset: "destroy",
            store: MongoStore.create({
                mongoUrl: process.env.MONGO_URI,
                dbName: process.env.MONGO_DB,
                stringify: false,
            }),
        };
        // modify session options for development:
        if (["development", "test"].includes(process.env.NODE_ENV)) {
            mySessionOptions.cookie.secure = false;
            mySessionOptions.cookie.sameSite = "lax";
        }
        this.app.use(session(mySessionOptions));

        // Morgan logger:
        if (["development", "test"].includes(process.env.NODE_ENV)) this.app.use(morgan(":method :url status=:status :date[iso] rt=:response-time ms"));
        if (["deployment", "production"].includes(process.env.NODE_ENV)) this.app.use(morgan("tiny"));
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    private initializeControllers(controllers: IController[]) {
        controllers.forEach(controller => {
            this.app.use("/", controller.router);
        });
    }

    public async connectToTheDatabase(port?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // execute some code here
            config(); // Read and set variables from .env file (only during development).
            const { MONGO_URI, MONGO_DB, PORT } = process.env;
            mongoose.set("strictQuery", true); // for disable DeprecationWarning
            mongoose.connect(MONGO_URI, { dbName: MONGO_DB }).catch(error => console.log(`Mongoose error on connection! Message: ${error.message}`));

            mongoose.connection.on("error", error => {
                // console.log(`Mongoose error message: ${error.message}`);
                reject(`Mongoose error message: ${error.message}`);
            });
            mongoose.connection.on("connected", () => {
                // console.log("Connected to MongoDB server.");
                this.initializeMiddlewares();
                this.initializeControllers(this.controllers);
                this.initializeErrorHandling();
                // this.listen();
                if (!port) port = PORT;
                // if (!PORT) port = "8000";
                this.app.listen(port, () => {
                    console.log(`App listening on the port ${port}`);
                });
                resolve("Connected to MongoDB server.");
            });
        });
    }
}
