import { masterUnitController } from "../../controllers/index.controller.js";

const masterUnitRouters = (io, socket) => {

  socket.on("ms-unit:all", async (data) => {
    masterUnitController.getAllUnit(data, socket, io, "ms-unit:all");
  });

  socket.on("ms-unit:create", (data) => {
    masterUnitController.createUnit(data, socket, io, "ms-unit:create")
  });
  // update unit ==============
  socket.on("ms-unit:update", (data) => {
    masterUnitController.updateUnit(data, socket, io, "ms-unit:update")
  });
  // getById unit 

  socket.on("ms-unit:by-id", (data) => {
    masterUnitController.getUnitById(data, socket, io, "ms-unit:by-id")
  });
};
export default masterUnitRouters;

// Import user routes and apply them to the socket.io server
