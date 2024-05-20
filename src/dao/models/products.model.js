import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { v4 } from "uuid";
const productsCollection = "products";

const productSchema = mongoose.Schema({
  owner: {
    type: String,
    default: "admin",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    default: v4,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 1,
  },
  category: {
    type: String,
    required: true,
  },
  thumbnails: [
    {
      type: String,
      required: true,
    },
  ],
});

productSchema.plugin(mongoosePaginate);

const productModel = mongoose.model(productsCollection, productSchema);
export default productModel;
