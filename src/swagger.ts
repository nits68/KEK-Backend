import { config } from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";

config();

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Kisalföld e-kosár (KEK) ER-diagram v1.0",
            version: "0.0.1",
            description: "<img alt='DB_diagram' height='800px' src='https://i.imgur.com/WDldL38.jpg' />",
        },
        servers: [
            {
                url: ((process.env.NODE_ENV == "deployment" || process.env.NODE_ENV == "production") ? 
                "https://rigid-pearline-nits-b71ca532.koyeb.app" : "http://localhost:8000"),
            },
            
            {
                url: "http://localhost:5000",
            },
        ],
    },
    apis: [`${__dirname}/**/*.{dto,controller,model,exception,schema}.{ts,js,yml}`],
};

export default swaggerJsdoc(options);
