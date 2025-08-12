/* eslint-disable no-unused-vars */

import { masterRoleControllers } from "../../controllers/index.controller.js";
import roleControllers from "../../controllers/role.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { apiResponse } from "../../utility/response.util.js";

const masterRoleRouters = (io, socket) => {
  // TODO also make sure that only admin can modify and create roles

  // create a new role

  socket.on("ms-role:create", async (data) => {
    masterRoleControllers.createRole(data, socket, io, "ms-role:create");
  });

  //   get role by role id
  socket.on("ms-role:by-id", async (data) => {
    masterRoleControllers.getRoleById(data, socket, io, "ms-role:by-id");
  });

  //   update role
  socket.on("ms-role:update", async (data) => {
    masterRoleControllers.updateRole(data, socket, io, "ms-role:update");
  });

  //   delete role
  socket.on("ms-role:delete", async (data) => {
    masterRoleControllers.deleteRole(data, socket, io, "ms-role:delete");
  });
};

export default masterRoleRouters;