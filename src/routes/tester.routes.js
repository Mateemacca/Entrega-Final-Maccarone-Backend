import { Router } from "express";

const testRoutes = Router();

testRoutes.get("/testlogger", (req, res) => {
  req.logger.info("Esto es un log de info");
  req.logger.warning("Esto es un warning");
  req.logger.error("Esto es un error");
  req.logger.fatal("Esto es un error FATAL");
  req.logger.debug("Esto es un debug");
  res.send({ message: "Errores test enviados" });
});

export default testRoutes;
