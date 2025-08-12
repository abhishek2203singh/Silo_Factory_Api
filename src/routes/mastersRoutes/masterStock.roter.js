import { masterStockControllers } from "../../controllers/index.controller.js";

function masterStockRouters(io, socket) {
  // create new stock space
  socket.on("ms-stock:create", (data) => {
    masterStockControllers.createStockSpace(
      data,
      socket,
      io,
      "ms-stock:create"
    );
  });
  socket.on("ms-stock:create-single", (data) => {
    masterStockControllers.createSingleStockSpaceAccordingToPackingSizeId(
      data,
      socket,
      io,
      "ms-stock:create-single"
    );
  });

  // update existing stock space
  socket.on("ms-stock:update", (data) => {
    masterStockControllers.updateStockSpace(
      data,
      socket,
      io,
      "ms-stock:update"
    );
  });

  // delete existing stock space
  socket.on("ms-stock:delete", (data) => {
    masterStockControllers.deleteStockSpace(
      data,
      socket,
      io,
      "ms-stock:delete"
    );
  });
  // get stock space by id
  socket.on("ms-stock:by-id", (data) => {
    masterStockControllers.getStockSpaceById(
      data,
      socket,
      io,
      "ms-stock:by-id"
    );
  });
  // get all stock spaces
  socket.on("ms-stock:all", (data) => {
    masterStockControllers.getAllStockSpaces(data, socket, io, "ms-stock:all");
  });
}

export default masterStockRouters;
