import { otherDepartmentControllers } from "../controllers/index.controller.js";

function otherDepartmentRouters(io, socket) {
  // to insert new entry in other departments
  socket.on("other-dpt:add", (data) => {
    otherDepartmentControllers.addNewEntry(data, socket, io, "other-dpt:add");
  });

  // update an existing entry
  socket.on("other-dpt:update", (data) => {
    otherDepartmentControllers.updateEntry(
      data,
      socket,
      io,
      "other-dpt:update"
    );
  });

  //   delete an an existing entry
  socket.on("other-dpt:delete", (data) => {
    otherDepartmentControllers.deleteEntry(
      data,
      socket,
      io,
      "other-dpt:delete"
    );
  });

  // set all entries according to curret user
  socket.on("other-dpt:all", (data) => {
    otherDepartmentControllers.getAllDataAccordingToDepartmentId(
      data,
      socket,
      io,
      "other-dpt:all"
    );
  });

  // get all department according to Id
  socket.on('other-dpt:by-id', (data) => {
    otherDepartmentControllers.getDepartmentById(data, socket, io, 'other-dpt:by-id')
  })
}

export default otherDepartmentRouters;
