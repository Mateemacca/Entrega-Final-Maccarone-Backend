const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");

const addProductToCart = async (pid, cartId) => {
  try {
    const result = await fetch(
      `http://localhost:8080/api/carts/${cartId}/product/${pid}`,
      {
        body: JSON.stringify({
          quantity: 1,
        }),
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (result.ok) {
      Swal.fire({
        icon: "success",
        text: `Product added to cart successfully`,
        toast: true,
        position: "top-start",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire({
        text: "Error trying to add product to cart",
        toast: true,
        position: "top-right",
        icon: "error",
      });
    }
  } catch (error) {
    Swal.fire({
      text: "Server Error",
      toast: true,
      position: "top-right",
      icon: "error",
    });
  }
};

for (let btn of addToCartBtns) {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const cart = await getCartId();
    addProductToCart(btn.id, cart);
  });
}

async function getCartId() {
  try {
    const response = await fetch("http://localhost:8080/api/session/current");
    if (response.ok) {
      const data = await response.json();
      const cart = data.user.cart;
      return cart;
    } else {
      console.error("Error trying to obtain user data");
      return null;
    }
  } catch (error) {
    console.error("Error trying to obtain user data:", error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".delete-product-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const productId = button.id;
      try {
        const response = await fetch(
          `http://localhost:8080/api/products/${productId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          const productCard = document.getElementById(`product-${productId}`);
          if (productCard) {
            await productCard.remove();
          }
          await Swal.fire({
            icon: "success",
            text: `Product added to cart successfully`,
            toast: true,
            position: "top-start",
            showConfirmButton: false,
            timer: 1500,
          });
          location.reload();
        } else {
          Swal.fire({
            icon: "error",
            text: `Error deleting product`,
            toast: true,
            position: "top-start",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    });
  });
});
