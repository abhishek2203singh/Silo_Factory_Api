import { silosControllers } from "../controllers/index.controller.js";

function silosRouters(io, socket) {
  // add new entry in silos
  socket.on("silos:add", (data) => {
    silosControllers.insertInSilo(data, socket, io, "silos:add");
  });
  // api to fetch all data from Silo info 
  socket.on("silo-info:all", (data) => {
    silosControllers.getAllSiloInfoData(data, socket, io, "silo-info:all");
  })
}

export default silosRouters;
