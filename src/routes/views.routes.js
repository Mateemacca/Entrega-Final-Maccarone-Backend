import { Router } from "express";
import productModel from "../dao/models/products.model.js";
import { productsService } from "../controllers/products.controller.js";
import {
  checkAuth,
  checkExistingUser,
  isAdmin,
  validateAdminCredentials,
} from "../middlewares/auth.js";
import cartModel from "../dao/models/carts.model.js";
import CartRepository from "../dao/repositories/cart.repository.js";
import UserRepository from "../dao/repositories/session.repository.js";
import { userModel } from "../dao/models/user.model.js";

const cartRepository = new CartRepository(cartModel);
const userRepository = new UserRepository(userModel);

const viewsRouter = Router();

viewsRouter.get("/", checkAuth, async (req, res) => {
  const { user } = req.session;
  res.render("home", { user });
});

viewsRouter.get("/products", checkAuth, async (req, res) => {
  try {
    const { user } = req.session;
    const { limit = 10, page = 1, query = "", sort = "" } = req.query;
    const [code, value] = query.split(":");
    const products = await productsService.getProducts(
      limit,
      page,
      code,
      value,
      sort
    );
    if (products) products.payload = products.docs;
    delete products.docs;

    res.render("products", { products, user });
  } catch (error) {
    res.status(400).send({ error: "Error al obtener los productos" });
    console.log(error);
  }
});

viewsRouter.get("/chat", checkAuth, async (req, res) => {
  res.render("chat");
});

viewsRouter.get("/login", checkExistingUser, (req, res) => {
  res.render("login");
});
viewsRouter.get("/register", checkExistingUser, (req, res) => {
  res.render("register");
});
viewsRouter.get("/login", validateAdminCredentials, (req, res) => {
  req.session.user = { role: "admin" };
  res.redirect("/products");
});
viewsRouter.get("/restore-password", checkExistingUser, (req, res) => {
  res.render("restore-password");
});

viewsRouter.get("/faillogin", (req, res) => {
  res.render("faillogin");
});

viewsRouter.get("/failregister", (req, res) => {
  res.render("failregister");
});
viewsRouter.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});
viewsRouter.get("/change-role", isAdmin, async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    res.render("change-role", { users });
  } catch (error) {
    console.error("Error al obtener los usuarios", error);
    res.status(500).send({ message: "Error al obtener los usuarios" });
  }
});

viewsRouter.get("/cart/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartRepository.getCartById(cid);
    const user = req.user;

    res.render("cart", { cart, user });
  } catch (error) {
    res.status(400).send({ error: "Error al obtener el carrito" });
    console.log(error);
  }
});

export default viewsRouter;
