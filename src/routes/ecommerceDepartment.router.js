import { ecommerceDepartmentControllers } from '../controllers/index.controller.js';
function ecommerceDepartmentRouters(io, socket) {

  // add new request for stock incommig  / outgoing
  socket.on("ecommerce-dpt:add", (data) => {
    ecommerceDepartmentControllers.addNewEntry(data, socket, io, "ecommerce-dpt:add");
  });

  socket.on("ecommerce-dpt:all", (data) => {
    ecommerceDepartmentControllers.getAllEntries(data, socket, io, "ecommerce-dpt:all");
  });

  socket.on("ecommerce-dpt:get-data-by-id", (data) => {
    ecommerceDepartmentControllers.fetchDatabyEdprtId(data, socket, io, "ecommerce-dpt:get-data-by-id");
  });

  //   to update an existing record
  socket.on("ecommerce-dpt:update", (data) => {
    ecommerceDepartmentControllers.updateEntry(data, socket, io, "ecommerce-dpt:update");
  });

  socket.on("ecommerce-dpt:delete", (data) => {
    ecommerceDepartmentControllers.deleteEntry(data, socket, io, "ecommerce-dpt:delete");
  });

}

export default ecommerceDepartmentRouters;