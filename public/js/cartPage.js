const purchaseBtn = document.getElementById("purchase-cart");

purchaseBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const cartId = purchaseBtn.dataset.cart;
  console.log(cartId);
  await purchaseCart(cartId);
});

async function purchaseCart(cartId) {
  const url = `http://localhost:8080/api/carts/${cartId}/purchase`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const ticketData = await response.json();
      console.log(ticketData);
      const cartItems = document.getElementById("cartItems");
      cartItems.style.display = "none";
      purchaseBtn.style.display = "none";
      Swal.fire({
        icon: "success",
        text: `Purchase completed, total: $${ticketData.ticket.amount}!`,
        toast: true,
        position: "top-start",
        showConfirmButton: false,
        timer: 1500,
      });
      // muestra el ticket de compra
      const fecha = new Date(ticketData.ticket.purchase_datetime);
      const fechaFormateada = `${fecha.getDate()}/${
        fecha.getMonth() + 1
      }/${fecha.getFullYear()} at ${fecha.getHours()}:${(
        "0" + fecha.getMinutes()
      ).slice(-2)}`;
      const ticketInfoDiv = document.getElementById("ticketInfo");
      ticketInfoDiv.innerHTML = `
     
      <div class="container mx-auto">
  <div class="flex justify-center">
    <div class="max-w-3xl bg-white shadow-md rounded-lg overflow-hidden">
      <div class="bg-gray-200 text-center py-6">
        <h2 class="text-3xl font-bold">Purchase Ticket</h2>
      </div>
      <div class="p-8">
        <p class="text-lg"><strong>Ticket ID:</strong> ${ticketData.ticket.code}</p>
        <p class="text-lg"><strong>Total:</strong> ${ticketData.ticket.amount}</p>
        <p class="text-lg"><strong>Purchaser:</strong> ${ticketData.ticket.purchaser}</p>
        <p class="text-lg"><strong>Purchase date:</strong> ${fechaFormateada}</p>
      </div>
    </div>
  </div>
</div>

        `;
    } else {
      console.error("Error:", response.status);
      await Swal.fire({
        icon: "error",
        text: `Error purchasing cart`,
        toast: true,
        position: "top-start",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
