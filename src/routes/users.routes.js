import { Router } from "express";
import { checkAuth } from "../middlewares/auth.js";

import upload from "../utils/multer.js";
import {
  deleteInactiveUsers,
  deleteUserById,
  getAllUsers,
  updateUserPremiumStatus,
  uploadUserDocuments,
} from "../controllers/users.controller.js";

const userRoutes = Router();

userRoutes.get("/", getAllUsers);

userRoutes.put("/premium/:uid", checkAuth, updateUserPremiumStatus);

userRoutes.post(
  "/:uid/documents",
  upload.array("documents", 5),
  uploadUserDocuments
);

userRoutes.delete("/", deleteInactiveUsers);
userRoutes.delete("/:uid", deleteUserById);

export default userRoutes;
