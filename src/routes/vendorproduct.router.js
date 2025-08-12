import { vendorProductController } from "../controllers/index.controller.js";

const vendorProductRouters = (io, socket) => {
  // route for user registration
  socket.on("ProductBy:vendorId", async (data) => {
    vendorProductController.getProductByVendorId(data, socket, io);
  });
};
export default vendorProductRouters;

// Import user routes and apply them to the socket.io server
