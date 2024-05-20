logoutBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  Swal.fire({
    title: "Are you sure you want to logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Log out",
    cancelButtonText: "Cancel",
  }).then(async (result) => {
    if (result.isConfirmed) {
      const result = await fetch("http://localhost:8080/api/session/logout", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { redirect } = await result.json();
      window.location.href = redirect;
    }
  });
});
