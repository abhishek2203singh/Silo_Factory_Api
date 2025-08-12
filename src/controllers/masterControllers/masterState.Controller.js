import Yup from "yup";
import { MasterState } from "../../model/masterState.model.js";
import { apiResponse } from "../../utility/response.util.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { customMessage } from "../../utility/messages.util.js";
const masterStatecontroller = {
  async createState(data, socket, io, currentRoute) {
    try {
      const stateSchema = Yup.object({
        stateName: Yup.string("Invalid state Name").required(
          "Please, Enter State Name"
        ),
        priorityLevel: Yup.string()
          .oneOf(
            ["permanent", "temporary"],
            "Please select state priority level like , permanent or temporary"
          )
          .required("Priority Level is required.!")
          .default("temporary"),
      });
      const { stateName, priorityLevel } = await stateSchema.validate(data);
      const stateIsExists = await MasterState.findOne({
        where: {
          name: stateName,
        },
      });
      if (stateIsExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `State '${stateName}' is already exists!`
          ),
        });
      }
      let StateResult = await MasterState.create({
        name: stateName,
        is_deletable: priorityLevel == "permanent" ? false : true,
      });
      if (!StateResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            ` something went wrong while creating state!`
          ),
        });
      }
      StateResult = jsonFormator(StateResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `State '${stateName}' created successfully !!`
        ),
      });
      masterStatecontroller.getAllState(data, socket, io, "state:all");
      masterStatecontroller.getAllState(data, socket, io, "ms-state:all");
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
  async updateState(data, socket, io, currentRoute) {
    try {
      const stateSchema = Yup.object({
        stateId: Yup.number(customMessage.badReq).required(
          customMessage.badReq
        ),
        stateName: Yup.string("Invalid State name").required(
          "Please, Enter state name !!"
        ),
        priorityLevel: Yup.string()
          .oneOf(
            ["permanent", "temporary"],
            "Please select state priority level like , permanent or temporary"
          )
          .required("Priority Level is required.!")
          .default("temporary"),
      });
      const { stateId, stateName, priorityLevel } = await stateSchema.validate(
        data
      );
      let updateResult = await MasterState.findOne({
        where: {
          id: stateId,
        },
      });
      if (!updateResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "State not found!!", currentRoute),
        });
      }
      updateResult = jsonFormator(updateResult);
      if (!updateResult.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `State ${updateResult?.name} cant't be modified !!`
          ),
        });
      }
      let [updateData] = await MasterState.update(
        {
          name: stateName,
          is_deletable: priorityLevel == "permanent" ? false : true,
        },
        {
          where: {
            id: stateId,
          },
        }
      );
      if (!updateData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `State ${stateName} not updated`,
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `State` + customMessage.updSucc,
          currentRoute
        ),
      });
      masterStatecontroller.getAllState(data, socket, io, "ms-state:all");
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
  async getStatebyId(data, socket, io, currentRoute) {
    try {
      const { stateId = false } = data;
      if (!stateId || stateId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      let stateById = await MasterState.findOne({
        where: {
          id: stateId,
        },
      });
      if (!stateById) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "State not found!!",
            currentRoute,
            "state not found!!"
          ),
        });
      }
      stateById = jsonFormator(stateById);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "State fetched successfully !!",
          currentRoute,
          stateById
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async getAllState(data, socket, io, currentRoute) {
    try {
      let allStateResult = await MasterState.findAll({
        order: [["created_on", "DESC"]],
      });
      allStateResult = jsonFormator(allStateResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "State fetched seccessully !!",
          currentRoute,
          allStateResult
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};
export default masterStatecontroller;
