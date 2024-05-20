import mongoose from "mongoose";
const { Schema } = mongoose;
const userCollection = "users";
import cartModel from "./carts.model.js";

const userSchema = mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    type: Schema.Types.ObjectId,
    ref: "cart",
  },
  role: {
    type: String,
    enum: ["user", "admin", "premium"],
    default: "user",
  },
  tokenPassword: {
    type: Object,
  },
  documents: [
    {
      name: String,
      reference: String,
    },
  ],
  last_connection: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.cart) {
    const newCart = await cartModel.create({ products: [] });
    this.cart = newCart._id;
  }
  next();
});

export const userModel = mongoose.model(userCollection, userSchema);
