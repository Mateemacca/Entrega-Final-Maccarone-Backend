// -> Dependencias
import express from "express";
import handlebars from "express-handlebars";
import swaggerJSDoc from "swagger-jsdoc";
import { Server } from "socket.io";
import session from "express-session";
import FileStore from "session-file-store";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import passport from "passport";
import swaggerUIExpress from "swagger-ui-express";

// -> Configs
import initializePassport from "./config/passport.config.js";
import config from "./config/config.js";
import { swaggerConfiguration } from "./utils/swagger-configuration.js";
import { ErrorHandler } from "./middlewares/error.js";
import { addLogger } from "./utils/logger.js";

// -> Routes
import viewsRouter from "./routes/views.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import productsRouter from "./routes/products.routes.js";
import cartRouter from "./routes/cart.routes.js";
import testRoutes from "./routes/tester.routes.js";

// -> Models
import messageModel from "./dao/models/messages.model.js";
import userRoutes from "./routes/users.routes.js";

const app = express();
const fileStore = FileStore(session);
const PORT = config.port || 8080;

const specs = swaggerJSDoc(swaggerConfiguration);
app.use("/apidocs", swaggerUIExpress.serve, swaggerUIExpress.setup(specs));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(addLogger);

console.log(config.nodeEnv);

let mongoUrl;

if (config.nodeEnv === "test") {
  mongoUrl = config.testMongoUrl;
} else {
  mongoUrl = config.mongoUrl;
}

app.use(
  session({
    secret: "s3cr3t0",
    store: MongoStore.create({
      mongoUrl: mongoUrl,
    }),
    resave: true,
    saveUninitialized: true,
  })
);
initializePassport();
app.use(passport.initialize());
app.use(passport.session());
const hbs = handlebars.create({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
  },
  helpers: {
    if_eq: function (a, b, opts) {
      if (a === b) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    },
    if_gt: function (a, b, opts) {
      if (a > b) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    },
  },
});

app.engine("handlebars", hbs.engine);
app.set("views", "src/views");
app.set("view engine", "handlebars");
console.log(mongoUrl);
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Conexión exitosa a la base de datos");
  })
  .catch((error) => {
    console.error("Error al conectar a la base de datos:", error);
  });

app.use("/api/products", productsRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewsRouter);
app.use("/api/session", sessionRoutes);
app.use("/api/test", testRoutes);
app.use("/api/users", userRoutes);

app.use(ErrorHandler);

const httpServer = app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

const io = new Server(httpServer);
const messages = [];

io.on("connection", async (socket) => {
  console.log("Usuario conectado");

  try {
    const storedMessages = await messageModel.find();
    socket.emit("storedMessages", storedMessages);
  } catch (error) {
    console.error("Error al recuperar los mensajes almacenados:", error);
  }

  socket.on("message", async (data) => {
    try {
      await messageModel.create(data);
      messages.push(data);
      io.emit("messageLogs", [data]);
    } catch (error) {
      console.error("Error al almacenar el nuevo mensaje:", error);
    }
  });

  socket.on("newUser", (user) => {
    io.emit("newConnection", "Un nuevo usuario se conectó");
    socket.broadcast.emit("notification", user);
  });
});

export { app };
