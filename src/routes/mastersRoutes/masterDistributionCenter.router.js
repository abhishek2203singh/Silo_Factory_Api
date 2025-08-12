import { masterDistributionCenterControllers } from "../../controllers/index.controller.js";

function masterDistributionCenterRouters(io, socket) {
  socket.on("ms-disribution-center:create", (data) => {
    masterDistributionCenterControllers.createDistibutionCenter(
      data,
      socket,
      io,
      "ms-disribution-center:create"
    );
  });
  socket.on("ms-disribution-center:update", (data) => {
    masterDistributionCenterControllers.updateDistibutionCenter(
      data,
      socket,
      io,
      "ms-disribution-center:update"
    );
  });
  socket.on("ms-disribution-center:delete", (data) => {
    masterDistributionCenterControllers.deleteDistibutionCenter(
      data,
      socket,
      io,
      "ms-disribution-center:delete"
    );
  });
  socket.on("ms-disribution-center:by-id", (data) => {
    masterDistributionCenterControllers.getDistibutionCenterById(
      data,
      socket,
      io,
      "ms-disribution-center:by-id"
    );
  });

  socket.on("ms-disribution-center:all", (data) => {
    masterDistributionCenterControllers.getAllDistibutionCenters(
      data,
      socket,
      io,
      "ms-disribution-center:all"
    );
  });
}

export default masterDistributionCenterRouters;
