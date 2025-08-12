import { masterEntryTypeControllers } from "../../controllers/index.controller.js";

function masterEntryTypeRouters(io, socket) {
  // add new entry in master entry type
  socket.on("ms-entry-type:create", (data) => {
    masterEntryTypeControllers.createEntryType(
      data,
      socket,
      io,
      "ms-entry-type:create"
    );
  });
  socket.on("ms-entry-type:update", (data) => {
    masterEntryTypeControllers.updateEntryType(
      data,
      socket,
      io,
      "ms-entry-type:update"
    );
  });
  socket.on("ms-entry-type:delete", (data) => {
    masterEntryTypeControllers.deleteEntryType(
      data,
      socket,
      io,
      "ms-entry-type:delete"
    );
  });
  socket.on("ms-entry-type:by-id", (data) => {
    masterEntryTypeControllers.getEntryTypeById(
      data,
      socket,
      io,
      "ms-entry-type:by-id"
    );
  });
  socket.on("ms-entry-type:all", (data) => {
    masterEntryTypeControllers.getAllEntryType(
      data,
      socket,
      io,
      "ms-entry-type:all"
    );
  });
}

export default masterEntryTypeRouters;
