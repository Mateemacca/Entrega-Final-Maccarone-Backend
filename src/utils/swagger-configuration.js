export const swaggerConfiguration = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentacion API de ecommerce",
      description: "Es una API de un ecommerce completo",
    },
  },
  apis: ["./src/docs/**/*.yaml"],
};
