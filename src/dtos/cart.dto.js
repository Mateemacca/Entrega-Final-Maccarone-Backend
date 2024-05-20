class CartDTO {
    constructor({ _id, products }) {
        this._id = _id;
        this.products = products.map(item => ({
            product: item.product.toString(), 
            quantity: item.quantity
        }));
    }
}

export default CartDTO;
