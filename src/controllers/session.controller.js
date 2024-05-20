import { userModel } from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils/bcrypt.js";
import MailingService from "../services/mailing.js";
import UserRepository from "../dao/repositories/session.repository.js";
import passport from "passport";
import UserDTO from "../dtos/user.dto.js";
import { generateToken, verifyToken } from "../utils/crypto.js";

const userRepository = new UserRepository(userModel);
const mailingService = new MailingService();

export const getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    const userDTO = new UserDTO(req.user);
    res.send({ user: userDTO });
  } else {
    res.status(401).json({ message: "Unauthenticated" });
  }
};

export const registerUser = (req, res) => {
  passport.authenticate("register", { failureRedirect: "/failregister" })(
    req,
    res,
    async () => {
      try {
        const user = await userRepository.registerUser(req.user);
        req.session.user = {
          first_name: user.first_name,
          last_name: user.last_name,
          age: user.age,
          email: user.email,
          role: user.role,
        };
        req.logger.info(`User registered with email: ${req.user.email}`);
        res.redirect("/products");
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error registering user" });
      }
    }
  );
};

export const loginUser = async (req, res) => {
  passport.authenticate("login", { failureRedirect: "/faillogin" })(
    req,
    res,
    async () => {
      try {
        const user = await userRepository.loginUser(
          req.body.email,
          req.body.password
        );

        user.last_connection = new Date();
        await user.save();

        req.session.user = {
          first_name: user.first_name,
          last_name: user.last_name,
          age: user.age,
          email: user.email,
          role: user.role,
          cart: user.cart,
        };

        res.status(200).redirect("/products");
      } catch (error) {
        req.logger.error("Error with credentials");
        res.status(400).send({ error: "Error with credentials" });
      }
    }
  );
};

export const logoutUser = async (req, res) => {
  try {
    await userRepository.logoutUser(req);
    res.send({
      redirect: "http://localhost:8080/login",
      message: "Logged out",
    });
  } catch (error) {
    console.error(error);
    req.logger.error("Error logging out");
    res.status(500).send({
      error: "Error logging out",
      message: "Error trying to logout",
    });
  }
};

export const passwordForbidden = async (req, res) => {
  try {
    const { email } = req.body;
    const tokenObj = generateToken();
    console.log(tokenObj);
    const user = await userRepository.getUser(email);
    await userRepository.updateUser(user._id, { tokenPassword: tokenObj });
    await mailingService.sendSimpleMail({
      from: "NodeMailer Contant",
      to: email,
      subject: "Change password",
      html: `
                <h1>Hello!!</h1>
                <p>Click this <a href="http://localhost:8080/api/session/restore-password/${tokenObj.token}">link</a> to reset your password.</p>
            `,
    });
    const emailSend = true;
    req.logger.info(`Email sent to ${email}`);
    res.render("forgot-password", { emailSend });
  } catch (error) {
    req.logger.error(error);
    res.status(400).send({ error });
  }
};

export const restorePasswordToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await userRepository.getUserToken(token);
    if (!user) {
      const newTitle = true;
      return res.render("forgot-password", { newTitle });
    }
    const tokenObj = user.tokenPassword;
    if (tokenObj && verifyToken(tokenObj)) {
      res.redirect("/restore-password");
    } else {
      const newTitle = true;
      res.render("forgot-password", { newTitle });
    }
  } catch (error) {
    req.logger.error(error);
    res.status(400).send({ error });
  }
};

export const restorePassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userRepository.getUser(email);
    if (!user) {
      req.logger.error("Unauthorized");
      return res.status(401).send({ message: "Unauthorized" });
    }
    if (isValidPassword(user, password)) {
      const samePassword = true;
      return res.render("restore-password", { samePassword });
    }
    user.password = createHash(password);
    await user.save();
    req.logger.info("Password saved");
    res.send(
      '<p>Password updated successfully</p> <a href="/login">Back to login</a>'
    );
  } catch (error) {
    req.logger.error(error);
    res.status(400).send({ error });
  }
};

export const githubLogin = passport.authenticate("github", {
  scope: ["user:email"],
});

export const githubCallback = passport.authenticate("github", {
  failureRedirect: "/login",
});

export const githubCallbackHandler = (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  req.session.user = req.user;
  res.redirect("/");
};
