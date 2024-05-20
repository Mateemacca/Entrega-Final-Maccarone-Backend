import config from "../config/config.js";

export const checkAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

export const checkExistingUser = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/products");
  }
  next();
};

export const validateAdminCredentials = (req, res, next) => {
  const { email, password } = req.body;

  if (email === config.adminName && password === config.adminPassword) {
    req.user = { _id: "adminId" };
    req.session.user = { role: "admin", id: req.user._id };
    console.log(req.session.user.id);
    return res.redirect("/products");
  }
  next();
};
export const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Unauthorized" });
  }
};

export const isUser = (req, res, next) => {
  if (req.session.user && req.session.user.role === "user") {
    next();
  } else {
    res.status(403).json({ message: "Unauthorized" });
  }
};

export const canManageProducts = (req, res, next) => {
  if (
    req.session.user &&
    (req.session.user.role === "admin" || req.session.user.role === "premium")
  ) {
    next();
  } else {
    res.status(403).json({ message: "Unauthorized" });
  }
};

export const canSendMessage = (req, res, next) => {
  if (req.session.user && req.session.user.role === "user") {
    next();
  } else {
    res.status(403).json({ message: "Unauthorized" });
  }
};

export const canAddToCart = (req, res, next) => {
  if (req.session.user && req.session.user.role === "user") {
    next();
  } else {
    res.status(403).json({ message: "Unauthorized" });
  }
};
