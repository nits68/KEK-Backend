import { config } from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";

config();

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Kisalföld e-kosár (KEK) ER-diagram",
            version: "0.0.1",
            description: "<img alt='DB_diagram' height='800px' src='https://i.imgur.com/xSjWLrt.jpg' />",
        },
        servers: [
            {
                url: process.env.BACKEND_API,
            },
        ],
    },
    apis: [`${__dirname}/**/*.{dto,controller,model,exception,schema}.{ts,js,yml}`],
};

export default swaggerJsdoc(options);
