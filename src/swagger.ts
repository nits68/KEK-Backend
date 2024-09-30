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
                url: "https://rigid-pearline-nits-b71ca532.koyeb.app:8000",
            },
            {
                url: "http://localhost:8000",
            },
            {
                url: "http://localhost:5000",
            },
        ],
    },
    apis: [`${__dirname}/**/*.{dto,controller,model,exception,schema}.{ts,js,yml}`],
};

export default swaggerJsdoc(options);
