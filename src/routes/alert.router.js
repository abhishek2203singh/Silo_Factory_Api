import { alertControllers } from "../controllers/index.controller.js";
const alertRouter = (io, socket) => {
  socket.on("alert:getbyuserId", async (data) => {
    alertControllers.getallertBylogId(data, socket, io, "alert:getbyuserId", socket.user.id);
  });

  socket.on("alert:viewbyId", async (data) => {
    alertControllers.viewbyId(data, socket, io, "alert:viewbyId");
  });
  // get all alert from master-alert type table
  socket.on("alert-type:all", (data) => {
    alertControllers.getAllAlertTypes(data, socket, io, "alert-type:all");
  });

};

export default alertRouter;
