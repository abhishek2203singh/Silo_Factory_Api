/* eslint-disable no-unused-vars */
import { plantmanagerControllers } from "../controllers/index.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { apiResponse } from "../utility/response.util.js";

function plantManagarRoutes(io, socket) {
  // route for menu items
  socket.on("approval:all", async (data) => {
    plantmanagerControllers.allapproval(data, socket, io, "approval:all");
  });
}

export default plantManagarRoutes;
