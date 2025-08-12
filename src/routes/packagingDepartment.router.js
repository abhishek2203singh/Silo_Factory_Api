import { packagingDptControllers } from "../controllers/index.controller.js";

function PackagingDepartmentRouters(io, socket) {
  socket.on("packaging-dpt:add", (data) => {
    packagingDptControllers.addNewEntry(data, socket, io, "packaging-dpt:add");
  });
  socket.on("packaging-dpt:update", (data) => {
    packagingDptControllers.updateEntry(
      data,
      socket,
      io,
      "packaging-dpt:update"
    );
  });
  socket.on("packaging-dpt:delete", (data) => {
    packagingDptControllers.deleteEntry(
      data,
      socket,
      io,
      "packaging-dpt:delete"
    );
  });
  socket.on("packaging-dpt:all", (data) => {
    packagingDptControllers.getAllEntries(
      data,
      socket,
      io,
      "packaging-dpt:all"
    );
  });
  socket.on("packaging-dpt:by-id", (data) => {
    packagingDptControllers.getEntryById(
      data,
      socket,
      io,
      "packaging-dpt:by-id"
    );
  });
}

export default PackagingDepartmentRouters;
