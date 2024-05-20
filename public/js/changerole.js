const changeRoleBtns = document.getElementsByClassName("changerolbtn");

Array.from(changeRoleBtns).forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const userId = btn.dataset.userid;
    console.log(userId);
    await changeUserRole(userId);
  });
});

async function changeUserRole(userId) {
  const url = `http://localhost:8080/api/users/premium/${userId}`;
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      await Swal.fire({
        icon: "success",
        text: `Rol del usuario ${data.user.first_name} ${data.user.last_name} ha sido cambiado a ${data.user.role}`,
        toast: true,
        position: "top-start",
        showConfirmButton: false,
        timer: 1500,
      });
      location.reload();
    } else {
      console.error("Error:", response.status);
      await Swal.fire({
        icon: "error",
        text: `Error cambiando el rol del usuario`,
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

const deleteUserBtns = document.getElementsByClassName("deleteUserBtn");
Array.from(deleteUserBtns).forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const userId = btn.dataset.userid;
    console.log(userId);
    await deleteUser(userId);
  });
});

async function deleteUser(userId) {
  const confirmDelete = await Swal.fire({
    icon: "warning",
    text: "Estas seguro de que deseas eliminar este usuario?",
    showCancelButton: true,
    confirmButtonText: "Si",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    position: "center",
  });

  if (confirmDelete.isConfirmed) {
    const url = `http://localhost:8080/api/users/${userId}`;
    try {
      const response = await fetch(url, {
        method: "DELETE",
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);

        await Swal.fire({
          icon: "success",
          text: `El usuario ${data.deletedUser.first_name} ${data.deletedUser.last_name} ha sido eliminado`,
          toast: true,
          position: "top-start",
          showConfirmButton: false,
          timer: 1500,
        });
        location.reload();
      } else {
        console.error("Error:", response.status);
        await Swal.fire({
          icon: "error",
          text: "Error al eliminar el usuario",
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
}
