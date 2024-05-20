import supertest from "supertest";
import { expect } from "chai";
import { app } from "../app.js";
import { userModel } from "../dao/models/user.model.js";
import cartModel from "../dao/models/carts.model.js";

const requester = supertest(app);

describe("Testing de Routers", () => {
  describe("Router de Products", () => {
    it("Deberia obtener todos los productos", async () => {
      const response = await requester.get("/api/products");

      expect(response.statusCode).to.equal(200);
      expect(response.body.docs).to.be.an("array");
    });

    it("Deberia obtener un producto por su ID", async () => {
      const productId = "65a8b8696d49c044988d00c9";

      const response = await requester.get(`/api/products/${productId}`);

      expect(response.statusCode).to.equal(200);
      expect(response.body).to.have.property("_id", productId);
    });
  });

  describe("Router de Carts", () => {
    let cartId;

    it("Deberia crear un carrito", async () => {
      const response = await requester.post("/api/carts");
      expect(response.statusCode).to.equal(200);
      cartId = response.body.newCart._id;
      return cartId;
    });

    it("Deberia obtener un carrito por su ID", async () => {
      const response = await requester.get(`/api/carts/${cartId}`);
      expect(response.statusCode).to.equal(200);
      expect(response.body.cart._id).to.exist;
      expect(response.body.cart.products).to.be.an("array");
    });

    it("Deberia agregar un producto al carrito", async () => {
      const productId = "65a8b8696d49c044988d00c9"; // id del producto ejemplo a agregar al carrito
      const response = await requester.post(
        `/api/carts/${cartId}/product/${productId}`
      );

      expect(response.body.products)
        .to.be.an("array")
        .that.has.lengthOf.above(0);
      expect(response.statusCode).to.equal(200);
    });
  });
  describe("Router de Session", () => {
    it("Deberia registrar un nuevo usuario", async () => {
      const mockedUser = {
        first_name: "tester",
        last_name: "testing",
        age: 99,
        email: "test@example.com",
        password: "password123",
      };

      const response = await requester
        .post("/api/session/register")
        .send(mockedUser);

      expect(response.statusCode).to.equal(200);
    });

    it("Deberia iniciar sesion de un usuario registrado", async () => {
      const credentials = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await requester
        .post("/api/session/login")
        .send(credentials);

      expect(response.statusCode).to.equal(200);
    });

    it("Deberia cerrar sesion de un usuario autenticado", async () => {
      const credentials = {
        email: "test@example.com",
        password: "password123",
      };

      const loginResponse = await requester
        .post("/api/session/login")
        .send(credentials);

      const logoutResponse = await requester.post("/api/session/logout");

      expect(logoutResponse.statusCode).to.equal(200);
    });
  });
  after(async function () {
    await userModel.deleteMany({});
    await cartModel.deleteMany({});
  });
});
