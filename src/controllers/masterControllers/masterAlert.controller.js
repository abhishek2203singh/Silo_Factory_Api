import Yup from "yup";
import { apiResponse } from "../../utility/response.util.js";
import { MasterAlertTypeModel } from "../../model/masterAlertType.model.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { customMessage } from "../../utility/messages.util.js";
import alertControllers from "../alert.controller.js";
const masterAlertControllers = {
  //   to create new alert-type
  async createAlertType(data, socket, io, currentRoute) {
    try {
      const alertTypeSchema = Yup.object({
        name: Yup.string("Invalid alert name")
          .transform((value, originalValue) => {
            console.log(value, originalValue);
            return value.toUpperCase();
          })
          .required("Alert name is required"),
        priorityLevel: Yup.string()
          .oneOf(
            ["permanent", "temporary"],
            "Please select alert's priority level like , permanent or temporary"
          )
          .required("priority level is required !")
          .default("temporary"),
      });
      const { name, priorityLevel } = await alertTypeSchema.validate(data, {
        abortEarly: true,
        striptUnknow: true,
      });

      //  identify if alert with given name already  exists

      const existingAlertType = await MasterAlertTypeModel.findOne({
        where: { name },
      });

      // if alert type exists already
      if (existingAlertType) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Alert ' ${name} '` + customMessage.exists,
            currentRoute,
            ""
          ),
        });
      }
      // to check whehere provide is a object or not
      if (typeof data !== "object" || data === null) {
        throw new Yup.ValidationError("Please check your inputs !");
      }
      let createAlterTypeResult = await MasterAlertTypeModel.create({
        name,
        is_deletable: priorityLevel == "permanent" ? false : true,
      });
      createAlterTypeResult = jsonFormator(createAlterTypeResult);
      if (!createAlterTypeResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            true,
            `An error occurred while creating the alert. `,
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Alert type '${name}' created successfully `,
          currentRoute
        ),
      });
      //   to reload all alert types
      alertControllers.getAllAlertTypes(data, socket, io, "alert-type:all");
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
  // get alert-type =>  by id
  async getAlertTypeById(data, socket, io, currentRoute) {
    try {
      const { alertTypeId = false } = data;
      if (!alertTypeId || alertTypeId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      //   fetch alert-type  by id
      let roleResult = await MasterAlertTypeModel.findOne({
        where: {
          id: alertTypeId,
          status: true,
        },
      });
      //   if alert-type not found
      if (!roleResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "Alert type  not found !", currentRoute),
        });
      }
      roleResult = jsonFormator(roleResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Alert Type fetched successfully",
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
  //   update alert-type
  async updateAlertType(data, socket, io, currentRoute) {
    try {
      const alertTypeSchema = Yup.object({
        alertTypeId: Yup.number(customMessage.badReq).required(
          customMessage.badReq
        ),
        name: Yup.string("Invalid alert type name").required(
          "Alert type name is required"
        ),
      });

      const { alertTypeId, name } = await alertTypeSchema.validate(data);

      //   find alert-type exists or not

      let alertTypeResult = await MasterAlertTypeModel.findOne({
        where: { id: alertTypeId },
      });

      // if alert-type not found
      if (!alertTypeResult || alertTypeResult == undefined) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, `Alert Type not found`, currentRoute),
        });
      }

      // if alert-type can't  be modified

      if (!alertTypeResult.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Alert Type  '${alertTypeResult?.name}' can't be modified !`
          ),
        });
      }
      //   update alert-type
      const [updateResult] = await MasterAlertTypeModel.update(
        {
          name,
          //   TODO if anything else is required to be  updated
          //   is_deletable: priorityLevel == "permanent" ? false : true,
        },
        {
          where: {
            id: alertTypeId,
          },
        }
      );
      //   if alert-type not updated in case of updateResult == 0
      if (!updateResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Alert type  '${name}' not updated `,
            currentRoute
          ),
        });
      }
      //   alert-type updated successfully
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `The alert type  '${alertTypeResult?.name}' has been successfully updated to '${name}'`,
          currentRoute
        ),
      });
      //   to reload all alert types
      alertControllers.getAllAlertTypes(data, socket, io, "alert-type:all");
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
  // delete alert-type
  async deleteAlertType(data, socket, io, currentRoute) {
    try {
      const { alertTypeId = false } = data;
      if (!alertTypeId || alertTypeId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      let alertTypeDetils = await MasterAlertTypeModel.findOne({
        where: {
          id: alertTypeId,
        },
      });
      // if role not found
      if (!alertTypeDetils) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Alert type  does not exists",
            currentRoute
          ),
        });
      }
      alertTypeDetils = jsonFormator(alertTypeDetils);
      //   in case of alert-ty can't be modified
      if (!alertTypeDetils.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Alert type ' ${alertTypeDetils.name} ' cannot be deleted `,
            currentRoute
          ),
        });
      }

      //   other wise change status to false

      const [deleteResult] = await MasterAlertTypeModel.update(
        {
          status: false,
        },
        {
          where: {
            id: alertTypeId,
          },
        }
      );
      // if  not updated
      if (!deleteResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            ` The alert type  ${alertTypeDetils?.name} is not deleted !`,
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `The alert type ' ${alertTypeDetils.name} ' has been deleted successfully ! `,
          currentRoute
        ),
      });
      //   to reload all alert types
      alertControllers.getAllAlertTypes(data, socket, io, "alert-type:all");
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};

export default masterAlertControllers;
