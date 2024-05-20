import winston from "winston";

const customLevelOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    fatal: "red",
    error: "magenta",
    warning: "yellow",
    info: "blue",
    debug: "white",
  },
};

const developmentLogger = winston.createLogger({
  levels: customLevelOptions.levels,
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelOptions.colors }),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      level: "error",
      filename: "./errors.log",
      format: winston.format.simple(),
    }),
  ],
});

const productionLogger = winston.createLogger({
  levels: customLevelOptions.levels,
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelOptions.colors }),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      level: "error",
      filename: "./errors.log",
      format: winston.format.simple(),
    }),
  ],
});

export const addLogger = (req, res, next) => {
  switch (process.env.NODE_ENV) {
    case "test":
      req.logger = developmentLogger;
      break;
    case "production":
      req.logger = productionLogger;
      break;
    default:
      throw new Error("Enviroment doesnt exists");
  }
  next();
};
