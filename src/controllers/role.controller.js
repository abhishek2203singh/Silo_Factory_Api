import { MasterRoleModel } from "../model/masterRole.model.js";
import { apiResponse } from "../utility/response.util.js";

import { jsonFormator } from "../utility/toJson.util.js";

const roleControllers = {
  // get all rolers
  async getAllRoles(data, socket, io, currentRoute) {
    try {
      let roles = await MasterRoleModel.findAll({
        order: [["created_on", "DESC"]],
      });
      roles = jsonFormator(roles);
      socket.emit(currentRoute, {
        ...apiResponse.success(true, "all roles", currentRoute, roles),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};

export default roleControllers;
