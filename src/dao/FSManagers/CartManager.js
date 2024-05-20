import fs from "fs";

class CartManager {
  constructor(path) {
    this.path = path;
  }

  static id = 0;
  carts = [];

  async getCarts() {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error al obtener los carritos ", error);
      res.send({ error: "Error al obtener los carritos" });
      return [];
    }
  }

  async saveCarts(carts) {
    try {
      await fs.promises.writeFile(
        this.path,
        JSON.stringify(carts, null, 2),
        "utf-8",
        (error) => {
          if (error) {
            console.error("Error al  guardar los carritos ", error);
            res.send({ error: "Error al guardar los carritos" });
          }
        }
      );
    } catch (error) {
      console.error("Error al guardar los carritos ", error);
      res.send({ error: "Error al guardar los carritos" });
    }
  }

  generateNewCartId(carts) {
    const lastCartId = carts.length > 0 ? carts[carts.length - 1].id : 0;
    return lastCartId + 1;
  }

  async createCart() {
    try {
      const carts = await this.getCarts();
      const newCart = {
        id: this.generateNewCartId(carts),
        products: [],
      };
      carts.push(newCart);
      await this.saveCarts(carts);
      return newCart;
    } catch (error) {
      console.error("Error al crear el carrito");
      res.send({ error: "Error al crear el carrito" });
    }
  }

  async getCartById(id) {
    try {
      const carts = await this.getCarts();
      const cart = carts.find((cart) => +cart.id === +id);
      if (!cart) {
        console.log("Carrito no encontrado");
        res.send({ error: "Carrito no encontrado" });
      }
      return cart;
    } catch (error) {
      console.error("Error al obtener el carrito por ID");
      res.send({ error: "Error al obtener el carrito por id" });
    }
  }

  async addProductToCart(cartId, productId, quantity) {
    try {
      const carts = await this.getCarts();
      const cartIndex = carts.findIndex((cart) => +cart.id === +cartId);

      if (cartIndex !== -1) {
        const existingProductIndex = carts[cartIndex].products.findIndex(
          (item) => item.product === productId
        );

        if (existingProductIndex !== -1) {
          // si el producto ya existe en el carrito, incrementa la cantidad
          carts[cartIndex].products[existingProductIndex].quantity += quantity;
        } else {
          carts[cartIndex].products.push({ product: productId, quantity });
        }

        await this.saveCarts(carts);
        return carts[cartIndex];
      } else {
        console.log("Carrito no encontrado");
        res.send({ error: "Carrito no encontrado" });
      }
    } catch (error) {
      console.error("Error al agregar el producto al carrito");
      res.send({ error: "Error al agregar el producto al carrito" });
    }
  }
}

export default CartManager;
