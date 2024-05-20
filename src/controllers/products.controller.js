import ProductRepository from "../dao/repositories/product.repository.js";
import productModel from "../dao/models/products.model.js";
import { generateProduct } from "../utils/faker.js";
import MailingService from "../services/mailing.js";

export const productsService = new ProductRepository(productModel);
const mailingService = new MailingService();

export const getProducts = async (req, res) => {
  try {
    const { limit = 10, page = 1, query = "", sort = "" } = req.query;
    const [code, value] = query.split(":");
    const products = await productsService.getProducts(
      limit,
      page,
      code,
      value,
      sort
    );
    res.send({ status: "success", ...products });
  } catch (error) {
    res.status(400).send({ error: "Error fetching products" });
    req.logger.error("Error fetching products");
    console.log(error);
  }
};

export const getProductById = async (req, res) => {
  const { pid } = req.params;
  try {
    const product = await productsService.getProductById(pid);
    if (product) {
      req.logger.info("Product found by ID!");
      res.send(product);
    } else {
      req.logger.error("Product not found");
      res.status(404).send({ error: "Product not found" });
    }
  } catch (error) {
    req.logger.error("Error searching for product");
    res.status(400).send({ error: "Error fetching product" });
  }
};

export const addProduct = async (req, res) => {
  const { title, description, price, category } = req.body;

  const userEmail = req.user ? req.user.email : null;

  const owner = userEmail ? userEmail : "admin";

  const userRole = req.user ? req.user.role : "admin";
  if (userRole !== "premium" && userRole !== "admin") {
    req.logger.error("Only premium users can add products.");
    return res
      .status(403)
      .json({ error: "Only premium users can add products." });
  }

  try {
    const newProduct = await productsService.addProduct({
      title,
      description,
      price,
      category,
      owner,
    });
    res.status(201).json(newProduct);
    req.logger.info("Product added successfully!");
  } catch (error) {
    req.logger.error("Error creating product:", error);
    res.status(400).send({ error: "Error adding product" });
  }
};

export const updateProduct = async (req, res) => {
  const { pid } = req.params;
  try {
    const updatedProduct = await productsService.updateProduct(pid, req.body);
    if (updatedProduct) {
      req.logger.info("Product updated successfully");
      res.send({ message: "Product updated" });
    } else {
      req.logger.error("Product not found");
      res.status(404).send({ error: "Product not found" });
    }
  } catch (error) {
    req.logger.error("Error updating product");
    res.status(400).send({ error: "Error updating product" });
    console.error(error);
  }
};

export const deleteProduct = async (req, res) => {
  const { pid } = req.params;
  const userRole = req.session.user.role;

  // validacion regex del email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  try {
    const product = await productsService.getProductById(pid);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // checkea que sea admin
    if (userRole === "admin") {
      if (
        product.owner !== "admin" &&
        typeof product.owner === "string" &&
        validateEmail(product.owner)
      ) {
        await mailingService.sendSimpleMail({
          from: "Ecommerce",
          to: product.owner,
          subject: `Product deleted`,
          html: `
              <h1>Your product ${product.title} has been deleted.</h1>
              <p>We inform you that your product ${product.title} has been successfully removed from the store.</p>
            `,
        });
      }
      await productsService.deleteProduct(pid);
      req.logger.info("Product deleted successfully by admin");
      return res.status(200).json({ message: "Product deleted successfully" });
    }

    if (userRole === "premium" && product.owner === req.session.user.email) {
      await mailingService.sendSimpleMail({
        from: "Ecommerce",
        to: product.owner,
        subject: `Product deleted`,
        html: `
              <h1>Your product ${product.title} has been successfully deleted.</h1>
              <p>We inform you that you have deleted your product ${product.title} from the store.</p>
            `,
      });
      await productsService.deleteProduct(pid);
      req.logger.info("Product deleted successfully by premium user");
      return res.status(200).json({ message: "Product deleted successfully" });
    }

    req.logger.error("User does not have permissions to delete product");
    return res.status(403).json({ message: "Not authorized" });
  } catch (error) {
    console.error("Error deleting product:", error);
    req.logger.error("Error deleting product");
    return res.status(400).send({ error: "Error deleting product" });
  }
};

export const mockedProducts = async (req, res) => {
  const users = [];
  for (let i = 0; i < 100; i++) {
    users.push(generateProduct());
  }
  res.send({ status: "success", payload: users });
};
