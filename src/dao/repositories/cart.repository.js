import mongoose from "mongoose";

export default class CartRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getAllCarts() {
    try {
      return await this.dao.find();
    } catch (error) {
      console.error("Error retrieving all carts:", error);
    }
  }

  async createCart() {
    try {
      return await this.dao.create({ products: [] });
    } catch (error) {
      console.error("Error creating cart:", error);
    }
  }

  async getCartById(cartId) {
    try {
      return await this.dao
        .findOne({ _id: cartId })
        .populate("products.product");
    } catch (error) {
      console.error("Error retrieving cart:", error);
    }
  }

  async addProductToCart(cartId, productId) {
    const quantity = 1;
    try {
      const cart = await this.dao.findOne({ _id: cartId });
      if (!cart) {
        console.error("Cart not found");
        return;
      }

      const existingProduct = cart.products.find(
        (item) => item.product.toString() === productId
      );
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

      await cart.save();
      return cart;
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  }

  async deleteCart(cartId) {
    try {
      const deleted = await this.dao.updateOne(
        { _id: cartId },
        { products: [] }
      );
      if (deleted.modifiedCount > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error deleting cart:", error);
    }
  }

  async deleteProductFromCart(cartId, productId) {
    try {
      const result = await this.dao.updateOne(
        { _id: cartId },
        {
          $pull: {
            products: { product: new mongoose.Types.ObjectId(productId) },
          },
        }
      );

      if (result.modifiedCount > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error deleting product from cart:", error);
    }
  }

  async updateCart(cartId, cart) {
    try {
      return await this.dao.updateOne({ _id: cartId }, cart);
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  }

  async updateProductInCart(cartId, productId, quantity) {
    if (!quantity) {
      return false;
    }

    try {
      const cart = await this.dao.findOne({ _id: cartId });
      if (!cart) {
        return false;
      }

      const product = cart.products.find(
        (product) => product.product.toString() === productId
      );
      if (!product) {
        return false;
      }

      product.quantity = quantity;
      await cart.save();
      return true;
    } catch (error) {
      console.error("Error updating product in cart:", error);
    }
  }
}
