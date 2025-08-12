import { ecommerceUserControllers } from "../controllers/index.controller.js";

function ecommerceUserRouters(io, socket) {
  // add new request for stock incommig  / outgoing
  socket.on("ecommerce-user:add", (data) => {
    ecommerceUserControllers.addNewEntry(data, socket, io, "ecommerce-user:add");
  });

  socket.on("ecommerce-user:all", (data) => {
    ecommerceUserControllers.getAllEcommUsers(data, socket, io, "ecommerce-user:all");
  });

  socket.on("ecommerce-user:get-by-id", async (data) => {
    ecommerceUserControllers.getById(data, socket, io, "ecommerce-user:get-by-id");
  });

  socket.on("ecommerce-user:update", async (data) => {
    ecommerceUserControllers.updateEntry(data, socket, io, "ecommerce-user:update");
  });

  socket.on("ecommerce-user:delete", async (data) => {
    ecommerceUserControllers.deleteUser(data, socket, io, "ecommerce-user:delete");
  });

}

export default ecommerceUserRouters;