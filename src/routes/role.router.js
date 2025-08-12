import roleControllers from "../controllers/role.controller.js";

function roleRouters(io, socket) {
  // get all user roles
  socket.on("role:all", async (data) => {
    roleControllers.getAllRoles(data, socket, io, "role:all");
  });
}

export default roleRouters;
