import { silosDepartmentControllers } from "../controllers/index.controller.js";
function silosDepartmentRouters(io, socket) {
  // inser entry
  socket.on("silos-dpt:add", (data) => {
    silosDepartmentControllers.addNewEntry(data, socket, io, "silos-dpt:add");
  });

  socket.on("silos-dpt:all", (data) => {
    silosDepartmentControllers.fetchAllDatafromSilodprt(
      data,
      socket,
      io,
      "silos-dpt:all"
    );
  });
  socket.on("silos-dpt:update-status", (data) => {
    silosDepartmentControllers.updateDatainSilodprt(
      data,
      socket,
      io,
      "silos-dpt:update-status"
    );
  });
  socket.on("silos-dpt:get-data-by-id", (data) => {
    silosDepartmentControllers.fetchDatabySilodprtId(
      data,
      socket,
      io,
      "silos-dpt:get-data-by-id"
    );
  });
  socket.on("silos-dpt:dashboard", (data) => {
    silosDepartmentControllers.getDashboardData(
      data,
      socket,
      io,
      "silos-dpt:dashboard"
    );
  });
}

export default silosDepartmentRouters;
