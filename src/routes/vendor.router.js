import { vendorControllers } from "../controllers/index.controller.js";

const vendorRouters = (io, socket) => {
  // route for user registration
  socket.on("vendor:all", async (data) => {
    vendorControllers.getAllVendor(data, socket, io, "vendor:all");
  });
};
export default vendorRouters;

// Import user routes and apply them to the socket.io server
