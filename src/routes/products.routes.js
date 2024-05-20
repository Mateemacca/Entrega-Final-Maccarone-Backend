import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  getProductById,
  getProducts,
  mockedProducts,
  updateProduct,
} from "../controllers/products.controller.js";

import { isAdmin, canManageProducts } from "../middlewares/auth.js";
const productsRouter = Router();

productsRouter.get("/", getProducts);
productsRouter.get("/:pid", getProductById);
productsRouter.post("/", canManageProducts, addProduct);
productsRouter.put("/:pid", canManageProducts, updateProduct);
productsRouter.delete("/:pid", canManageProducts, deleteProduct);
productsRouter.get("/mocking/mockingproducts", mockedProducts);

export default productsRouter;
