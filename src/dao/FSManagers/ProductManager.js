import fs from 'fs'

class ProductManager {
    constructor(path) {
        this.path = path;
    }
    static id = 0;

    async addProduct(producto) {
        try {
            const productos = await this.getProducts();
            const newProduct = {
                id: this.generateNewProductId(productos),
                ...producto,
                status:true,
            };
            productos.push(newProduct);
            await this.guardarProductos(productos);
            return newProduct;
        } catch (error) {
            console.error('error al agregar el producto');
        }
    }
    generateNewProductId(productos) {
        const lastProductId = productos.length > 0 ? parseInt(productos[productos.length - 1].id) : 0;
        return (lastProductId + 1).toString();
    }
    async getProducts(limit) {
        try {
          const data = await fs.promises.readFile(this.path, 'utf-8');
          const products = JSON.parse(data);
      
          if (limit) {
            return products.slice(0, limit);
          }
      
          return products;
        } catch (error) {
          console.log('Error al obtener los productos:', error);
          return [];
        }
      }
      
    

    async getProductById(id) {
        try {
            const productos = await this.getProducts();
            const productoEncontrado = productos.find((producto) => +producto.id === +id);
            
            if (productoEncontrado === undefined) {
                console.log('Error, No se encontro el producto con ese id');
            }
            return productoEncontrado;
        } catch (error) {
            console.log('Error al obtener el producto por ID');
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            const productos = await this.getProducts();
            const productoExistente = productos.find((producto) => producto.id === id);
    
            if (productoExistente) {
                const productosActualizados = productos.map((producto) => {
                    if (producto.id === id) {
                        return { ...producto, ...updatedProduct };
                    }
                    return producto;
                });
    
                await this.guardarProductos(productosActualizados);
                return productosActualizados.find((producto) => producto.id === id);
            } else {
                console.log('Producto no encontrado');
            }
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
        }
    }
    

    async deleteProduct(id) {
        try {
            const productos = await this.getProducts();
            const productoParaEliminar = productos.find((producto) => +producto.id === +id);
            if (!productoParaEliminar) {
                console.log('producto para eliminar no encontrado');
                return;
            }
            const productosActualizados = productos.filter((producto) => +producto.id !== +id);
            await this.guardarProductos(productosActualizados);
        } catch (error) {
            console.error('Error al eliminar el producto');
        }
    }

    async guardarProductos(productos) {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(productos,null,2)); // "null" y "2" para que se acomode bien el array en el JSON
        } catch (error) {
            console.error('Error al intentar guardar los productos');
        }
    }
}


export default ProductManager