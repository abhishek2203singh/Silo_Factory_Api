import { masterStatecontroller } from "../../controllers/index.controller.js";

function masterStateRouter(io, socket) {
  // get state by id
  socket.on("ms-state:by-id", (data) => {
    masterStatecontroller.getStatebyId(data, socket, io, "ms-state:by-id");

  });
  // create state
  socket.on("ms-state:create", (data) => {
    masterStatecontroller.createState(data, socket, io, "ms-state:create");
  });
  // update state
  socket.on("ms-state:update", (data) => {
    masterStatecontroller.updateState(data, socket, io, "ms-state:update");
  });
  // get state by id
  socket.on("ms-state:by-id", (data) => {
    masterStatecontroller.getStatebyId(data, socket, io, "ms-state:by-id");
  });

  // get all state
  socket.on("ms-state:all", (data) => {
    masterStatecontroller.getAllState(data, socket, io, "ms-state:all");
  });
}
export default masterStateRouter;
