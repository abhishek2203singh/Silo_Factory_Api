import { masterPasteurizationSiloControllers } from "../../controllers/index.controller.js";

function masterPasteurizationSiloRouters(io, socket) {
  //   get all master silos
  socket.on("ms-ps-silo:all", async (data) => {
    masterPasteurizationSiloControllers.getAllSilos(
      data,
      socket,
      io,
      "ms-ps-silo:all"
    );
  });

  //   to crate new master silos
  socket.on("ms-ps-silo:create", async (data) => {
    masterPasteurizationSiloControllers.createSilo(
      data,
      socket,
      io,
      "ms-ps-silo:create"
    );
  });

  // to update master silos
  socket.on("ms-ps-silo:update", async (data) => {
    masterPasteurizationSiloControllers.updateSilo(
      data,
      socket,
      io,
      "ms-ps-silo:update"
    );
  });
  // to delete / inactivate master silos
  socket.on("ms-ps-silo:delete", async (data) => {
    masterPasteurizationSiloControllers.deleteSilo(
      data,
      socket,
      io,
      "ms-ps-silo:delete"
    );
  });

  //   to reactivate deleted / inactive silo
  socket.on("ms-ps-silo:reactivate", async (data) => {
    masterPasteurizationSiloControllers.reactivateSilo(
      data,
      socket,
      io,
      "ms-ps-silo:reactivate"
    );
  });

  // to get master silos details  silos id
  socket.on("ms-ps-silo:by-id", async (data) => {
    masterPasteurizationSiloControllers.getSiloById(
      data,
      socket,
      io,
      "ms-ps-silo:by-id"
    );
  });
}

export default masterPasteurizationSiloRouters;
