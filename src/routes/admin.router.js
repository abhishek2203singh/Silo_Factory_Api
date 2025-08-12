import { adminControllers } from "../controllers/index.controller.js";

function adminRouters(io, socket) {
  socket.on("admin:dashboard", (data) => {
    adminControllers.getALlDashboardData(data, socket, io, "admin:dashboard");
  });
}

export default adminRouters;
