import masterSilosControllers from "../../controllers/masterControllers/masterSilos.controller.js";

function masterSilosRouters(io, socket) {
  //   *********************************************** api which handle master silos  **************
  // follow api rule :1 api/rules.txt

  //   get all master silos
  socket.on("ms-silos:all", async (data) => {
    masterSilosControllers.getAllSilos(data, socket, io, "ms-silos:all");
  });

  //   to crate new master silos
  socket.on("ms-silos:create", async (data) => {
    masterSilosControllers.createSilo(data, socket, io, "ms-silos:create");
  });

  // to update master silos
  socket.on("ms-silos:update", async (data) => {
    masterSilosControllers.updateSilo(data, socket, io, "ms-silos:update");
  });
  // to delete / inactivate master silos
  socket.on("ms-silos:delete", async (data) => {
    masterSilosControllers.deleteSilo(data, socket, io, "ms-silos:delete");
  });

  //   to reactivate deleted / inactive silo
  socket.on("ms-silos:reactivate", async (data) => {
    masterSilosControllers.reactivateSilo(
      data,
      socket,
      io,
      "ms-silos:reactivate"
    );
  });

  // to get master silos details  silos id
  socket.on("ms-silos:by-id", async (data) => {
    masterSilosControllers.getSiloById(data, socket, io, "ms-silos:by-id");
  });
}

export default masterSilosRouters;
