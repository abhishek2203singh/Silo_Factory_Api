import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

const jwtUtil = {
  async signToken(data, expireTime = "600000s", secret = config.jwtKey) {
    try {
      const token = await jwt.sign(data, secret, {
        expiresIn: expireTime,
        algorithm: "HS256",
      });
      return {
        success: true,
        token,
      };
    } catch (error) {
      return {
        sccess: false,
        message: error.message,
      };
    }
  },

  async verifyToken(token, secret) {
    try {
      const data = await jwt.verify(token, secret);
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  },
};

export { jwtUtil };
