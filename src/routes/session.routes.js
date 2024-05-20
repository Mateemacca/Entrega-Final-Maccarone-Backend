import { Router } from "express";
import {
  getCurrentUser,
  githubCallback,
  githubCallbackHandler,
  githubLogin,
  loginUser,
  logoutUser,
  registerUser,
  restorePassword,
  passwordForbidden,
  restorePasswordToken,
} from "../controllers/session.controller.js";
import { checkAuth, validateAdminCredentials } from "../middlewares/auth.js";

const sessionRoutes = Router();

sessionRoutes.get("/current", getCurrentUser);
sessionRoutes.post("/register", registerUser);
sessionRoutes.post("/login", validateAdminCredentials, loginUser);
sessionRoutes.post("/logout", logoutUser);
sessionRoutes.post("/forgot-password", passwordForbidden);
sessionRoutes.get("/restore-password/:token", restorePasswordToken);
sessionRoutes.post("/restore-password", restorePassword);
sessionRoutes.get("/github", githubLogin);
sessionRoutes.get("/githubcallback", githubCallback, githubCallbackHandler);
export default sessionRoutes;
