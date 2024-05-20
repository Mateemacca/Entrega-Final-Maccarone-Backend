import mongoose from 'mongoose'
import { Router } from "express";
import { getAllCarts,
  createCart,
  getCartById,
  addProductToCart,
  deleteCart,
  deleteProductFromCart,
  updateOneCart,
  updateOneProductInCart,
  purchaseCart
} from '../controllers/cart.controller.js';
const cartRouter = Router()

cartRouter.get('/', getAllCarts);


cartRouter.post('/', createCart);

  
cartRouter.get('/:cid', getCartById);
  
cartRouter.post('/:cid/product/:pid', addProductToCart);
cartRouter.delete('/:cid',deleteCart);
cartRouter.delete('/:cid/products/:pid', deleteProductFromCart);
cartRouter.put('/:cid',updateOneCart)
cartRouter.put('/:cid/products/:pid', updateOneProductInCart)
cartRouter.post('/:cid/purchase', purchaseCart);

export default cartRouter;