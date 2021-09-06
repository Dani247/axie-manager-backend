import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DDauth rest API documentation",
      version: "1.0.0",
      description: "This is a simple Authentication API application made with Express and documented with Swagger, by Daniel Diaz"
    },
    servers: [
      {
        url: "http://localhost:5001"
      }
    ]
  },
  apis: ["./src/routes/*.ts", "./src/routes/*.js"],
};


export function swaggerSpecs() {
  return swaggerJsdoc(options);
}