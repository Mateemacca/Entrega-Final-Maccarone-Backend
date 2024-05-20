import CustomErrors from "../../services/errors/CustomErrors.js";
import ErrorEnum from "../../services/errors/error.enum.js";
import {
  generateProductErrorInfo,
  productNotFound,
} from "../../services/errors/info.js";

export default class ProductRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getProducts(limit = 10, page = 1, code, value, sort) {
    const filter = code ? { [code]: value } : {};
    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sort ? { price: sort } : {},
    };

    try {
      const products = await this.dao.paginate(filter, options);
      return products;
    } catch (error) {
      console.log("Error retrieving products");
    }
  }

  async getProductById(productId) {
    const product = await this.dao.findOne({ _id: productId });
    if (!product) {
      CustomErrors.createError({
        name: "Find product failed",
        cause: productNotFound(productId),
        message: "Error trying to find a single product",
        code: ErrorEnum.PRODUCT_NOT_FOUND,
      });
    }
    return product;
  }

  async addProduct(productData) {
    try {
      const newProduct = await this.dao.create(productData);
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  }

  async updateProduct(productId, updateData) {
    try {
      const updatedProduct = await this.dao.findByIdAndUpdate(
        productId,
        updateData,
        { new: true }
      );
      return updatedProduct;
    } catch (error) {
      console.log("Error updating product");
    }
  }

  async deleteProduct(productId) {
    try {
      await this.dao.findByIdAndDelete(productId);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }
}
