import CryptoJS from "crypto-js";

export const generateToken = () => {
  const timestamp = Date.now();
  const token = CryptoJS.lib.WordArray.random(20).toString(CryptoJS.enc.Hex);
  return {
    token,
    timestamp,
  };
};

export const verifyToken = (tokenObj) => {
  const now = Date.now();
  const timeElapsed = now - tokenObj.timestamp;
  const timeExpiredToken = 3600000;

  if (timeElapsed < timeExpiredToken) {
    return true;
  } else {
    return false;
  }
};
