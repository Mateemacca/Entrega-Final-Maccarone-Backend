import cartModel from "../dao/models/carts.model.js";
import CartRepository from "../dao/repositories/cart.repository.js";
import TicketRepository from "../dao/repositories/ticket.repository.js";
import { productsService } from "./products.controller.js";
const cartRepository = new CartRepository(cartModel);
const ticketRepository = new TicketRepository();

export const getAllCarts = async (req, res) => {
  const allCarts = await cartRepository.getAllCarts();
  res.send(allCarts);
};

export const createCart = async (req, res) => {
  const newCart = await cartRepository.createCart();
  res.send({ newCart });
};

export const getCartById = async (req, res) => {
  const { cid } = req.params;
  const cart = await cartRepository.getCartById(cid);
  if (cart) {
    req.logger.info(`Cart with ID ${cid} found!`);
    res.send({ cart });
  } else {
    req.logger.error("Cart not found");
    res.send({ error: "Cart not found" });
  }
};

export const addProductToCart = async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await cartRepository.getCartById(cid);
    const product = await productsService.getProductById(pid);

    if (!cart || !product) {
      return res.status(404).json({ error: "Cart or product not found" });
    }

    if (req.session.user && req.session.user.role) {
      const userRole = req.session.user.role;
      if (userRole === "premium" && product.owner === req.session.user.email) {
        req.logger.error("Premium user cannot add own product to cart");
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    const updatedCart = await cartRepository.addProductToCart(cid, pid);
    req.logger.info("Product added to cart successfully!");
    res.status(200).send(updatedCart);
  } catch (error) {
    console.error("Error adding product to cart:", error);
    req.logger.error("Error adding product to cart");
    res.status(500).json({ error: "Error adding product to cart" });
  }
};

export const deleteCart = async (req, res) => {
  const { cid } = req.params;
  const deleted = await cartRepository.deleteCart(cid);
  if (deleted === true) {
    req.logger.info("Products deleted successfully!");
    res.status(200).send({ message: "Products deleted successfully" });
  } else {
    req.logger.error("Error deleting cart products");
    res.status(500).send({ message: "Could not delete cart items" });
  }
};

export const deleteProductFromCart = async (req, res) => {
  const { cid, pid } = req.params;
  const result = await cartRepository.deleteProductFromCart(cid, pid);
  if (result) {
    req.logger.info("Product deleted from cart successfully!");
    res.send({ message: "Product deleted from cart successfully" });
  } else {
    req.logger.error("Error deleting product from cart");
    res.status(404).send({ error: "Product not found in cart" });
  }
};

export const updateOneCart = async (req, res) => {
  const { cid } = req.params;
  const cart = req.body;
  const result = await cartRepository.updateCart(cid, cart);
  if (result.modifiedCount > 0) {
    req.logger.info("Cart updated successfully!");
    res.send({ message: "Cart updated" });
  } else {
    req.logger.error("Error updating cart");
    res.status(400).send({ message: "Could not update cart" });
  }
};

export const updateOneProductInCart = async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  const result = await cartRepository.updateProductInCart(cid, pid, quantity);
  if (result === true) {
    req.logger.info("Product in cart updated successfully!");
    res.send({ message: "Product Updated" });
  } else {
    req.logger.error("Error updating product in cart");
    res.status(400).send({ message: "Could not update product" });
  }
};

export const purchaseCart = async (req, res) => {
  const { cid } = req.params;
  const result = await ticketRepository.processCartPurchase(
    cid,
    req.user.email
  );
  req.logger.info("Purchase completed successfully!");
  res.json(result);
};
