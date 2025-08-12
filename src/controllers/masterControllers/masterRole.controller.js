import Yup from "yup";
import { apiResponse } from "../../utility/response.util.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { customMessage } from "../../utility/messages.util.js";
import { MasterRoleModel } from "../../model/masterRole.model.js";
import roleControllers from "../role.controller.js";
const masterRoleControllers = {
  async createRole(data, socket, io, currentRoute) {
    try {
      console.log("creaRole =>", typeof data);
      const userRoleSchema = Yup.object({
        name: Yup.string("Invalid role name").required("Role name is required"),
        priorityLevel: Yup.string()
          .oneOf(
            ["permanent", "temporary"],
            "Please select role's priority level like , permanent or temporary"
          )
          .required("priority level is required !"),
      });
      const { name, priorityLevel } = await userRoleSchema.validate(data, {
        abortEarly: true,
        striptUnknow: true,
      });
      //  identify if role with given name already  exists
      const existingRole = await MasterRoleModel.findOne({ where: { name } });
      // if role exists already
      if (existingRole) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Role ' ${name} ' already exists`,
            currentRoute,
            ""
          ),
        });
      }
      // to check whehere provide is a object or not
      if (typeof data !== "object" || data === null) {
        throw new Yup.ValidationError("Please check your inputs !");
      }
      let createRole = await MasterRoleModel.create({
        name,
        is_deletable: priorityLevel == "permanent" ? false : true,
      });
      createRole = jsonFormator(createRole);
      if (!createRole) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            true,
            `An error occurred while creating the role. Please try again or contact support if the issue persists.`,
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Role '${name}' created successfully `,
          currentRoute,
          createRole
        ),
      });
      roleControllers.getAllRoles(data, socket, io, "role:all")
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, error.message, currentRoute, error),
        });
      }
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  // get role by  role id
  async getRoleById(data, socket, io, currentRoute) {
    try {
      const { roleId = false } = data;
      if (!roleId || roleId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      //   fetch role by id
      let roleResult = await MasterRoleModel.findOne({
        where: {
          id: roleId,
          status: true,
        },
      });
      //   if role not found
      if (!roleResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Role not found !",
            currentRoute,
            "Submenu not found"
          ),
        });
      }
      roleResult = jsonFormator(roleResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Role fetched successfully",
          currentRoute,
          roleResult
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  //   update menu
  async updateRole(data, socket, io, currentRoute) {
    try {
      const roleSchema = Yup.object({
        roleId: Yup.number(customMessage.badReq).required(
          customMessage.badReq
        ),
        name: Yup.string("Invalid role name").required("Role name is required"),
        priorityLevel: Yup.string()
          .oneOf(
            ["permanent", "temporary"],
            "Please select role's priority level like , permanent or temporary"
          )
          .required("priority level is required !"),
      });
      const { roleId, name, priorityLevel } = await roleSchema.validate(data);
      //   find role is role exists or note
      let roleResult = await MasterRoleModel.findOne({
        where: { id: roleId },
      });
      // if role not found
      if (!roleResult || roleResult == undefined) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, `Role not found`, currentRoute),
        });
      }
      // if role is can't be modified
      if (!roleResult.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Role '${roleResult?.name}' can't be modified as it is system role`
          ),
        });
      }
      //   update user role
      const [updateResult] = await MasterRoleModel.update(
        {
          name,
          is_deletable: priorityLevel == "permanent" ? false : true,
          updated_by: socket.user.id,
        },
        {
          where: {
            id: roleId,
          },
        }
      );
      //   if role not updated in case of updateResult == 0
      if (!updateResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Role '${name}' not updated `,
            currentRoute
          ),
        });
      }
      //   role updated successfully
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `The role '${roleResult?.name}' has been successfully updated to '${name}'`,
          currentRoute
        ),
      });
      roleControllers.getAllRoles(data, socket, io, "role:all")
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, error.message, currentRoute, error),
        });
      }
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  // delete Role
  async deleteRole(data, socket, io, currentRoute) {
    try {
      const { roleId = false } = data;
      if (!roleId || roleId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      let roleDetails = await MasterRoleModel.findOne({
        where: {
          id: roleId,
        },
      });
      // if role not found
      if (!roleDetails) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "Role does not exists", currentRoute),
        });
      }
      roleDetails = jsonFormator(roleDetails);
      if (!roleDetails.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Role ' ${roleDetails.name} ' cannot be deleted as it is a system role`
          ),
        });
      }
      //   other wise change status to false
      const [deleteResult] = await MasterRoleModel.update(
        {
          status: false,
          updated_by: socket.user.id,
        },
        {
          where: {
            id: roleId,
          },
        }
      );
      // if  not updated
      if (!deleteResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            ` The role ${roleDetails?.name} is not deleted !`,
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `The role ' ${roleDetails.name} ' has been deleted successfully ! `,
          currentRoute
        ),
      });
      roleControllers.getAllRoles(data, socket, io, "role:all")
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};
export default masterRoleControllers;
