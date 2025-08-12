import pasteurizationDptControllers from "../controllers/pasteurizationDepartment.controller.js";

function pasteurizationDptRuters(io, socket) {
  // to insert new entry in pasteurization-department table
  socket.on("pasteurization-dpt:add", (data) => {
    pasteurizationDptControllers.addNewEntry(
      data,
      socket,
      io,
      "pasteurization-dpt:add"
    );
  });
  //   to update an existing record
  socket.on("pasteurization-dpt:update", (data) => {
    pasteurizationDptControllers.updateEntry(
      data,
      socket,
      io,
      "pasteurization-dpt:update"
    );
  });
  //   delete entry
  socket.on("pasteurization-dpt:delete", (data) => {
    pasteurizationDptControllers.deleteEntry(
      data,
      socket,
      io,
      "pasteurization-dpt:delete"
    );
  });
  socket.on("pasteurization-dpt:get-data-by-id", (data) => {
    pasteurizationDptControllers.fetchDatabyPdprtId(
      data,
      socket,
      io,
      "pasteurization-dpt:get-data-by-id"
    );
  });
  socket.on("pasteurization-dpt:all", (data) => {
    pasteurizationDptControllers.getAllEntries(
      data,
      socket,
      io,
      "pasteurization-dpt:all"
    );
  });

  socket.on("pasteurization-dpt:dashboard", (data) => {
    pasteurizationDptControllers.getAllDashboardData(
      data,
      socket,
      io,
      "pasteurization-dpt:dashboard"
    );
  });
}

export default pasteurizationDptRuters;
