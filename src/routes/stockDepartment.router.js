import { stockDepartmentControllers } from "../controllers/index.controller.js";

function stockDepartmentRouters(io, socket) {
  // add new request for stock incommig  / outgoing
  socket.on("stock-dpt:add", (data) => {
    stockDepartmentControllers.addNewEntry(data, socket, io, "stock-dpt:add");
  });
  socket.on("stock-dpt:update", (data) => {
    stockDepartmentControllers.updateEntry(
      data,
      socket,
      io,
      "stock-dpt:update"
    );
  });
  socket.on("stock-dpt:by-id", (data) => {
    stockDepartmentControllers.getEntryById(
      data,
      socket,
      io,
      "stock-dpt:by-id"
    );
  });
  socket.on("stock-dpt:delete", (data) => {
    stockDepartmentControllers.deleteEntry(
      data,
      socket,
      io,
      "stock-dpt:delete"
    );
  });
  socket.on("stock-dpt:all", (data) => {
    stockDepartmentControllers.getAllEntries(data, socket, io, "stock-dpt:all");
  });
  socket.on("stock-dpt:all-by-entryId", (data) => {
    stockDepartmentControllers.getEntriesByEntryTypeId(data, socket, io, "stock-dpt:all-by-entryId");
  });
  socket.on("stock-dpt:send-stock-qty",(data)=>{
    stockDepartmentControllers.forDistributeQty(data,socket,io,"stock-dpt:send-stock-qty")
  })
  socket.on("stock-dpt:accept-stock-qty",(data)=>{
    stockDepartmentControllers.acceptReturnQty(data,socket,io,"stock-dpt:accept-stock-qty")
  });
  socket.on("stock-dpt:reject-stock-qty",(data)=>{
    stockDepartmentControllers.rejectReturnQty(data,socket,io,"stock-dpt:reject-stock-qty")
  });

}

export default stockDepartmentRouters;
