import Yup from "yup";
import { MasterDepartmentModel } from "../../model/masterDepartment.model.js";
import { apiResponse } from "../../utility/response.util.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { customMessage } from "../../utility/messages.util.js";
import departmentControllers from "../department.controller.js";
const MasterDepartmentModelControllers = {
  // to create anew department
  async createDepartment(data, socket, io, currentRoute) {
    try {
      const dptSchema = Yup.object({
        departmentName: Yup.string("invalid department name").required(
          "please enter department name"
        ),
        priorityLevel: Yup.string()
          .oneOf(
            ["permanent", "temporary"],
            "Please select Depatrment's priority level like , permanent or temporary"
          )
          .required("priority level is required !"),
      });

      const { departmentName, priorityLevel } = await dptSchema.validate(data);
      // fist find if department with this name already exists in database

      const departmentExists = await MasterDepartmentModel.findOne({
        where: {
          name: departmentName,
        },
      });
      if (departmentExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `department '${departmentName}'  already exists !`
          ),
        });
      }
      let departmentCreationResult = await MasterDepartmentModel.create({
        name: departmentName,
        is_deletable: priorityLevel == "permanent" ? false : true,
      });
      // if any department not created successfully
      if (!departmentCreationResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            ` something went wrong while creating department!`
          ),
        });
      }
      departmentCreationResult = jsonFormator(departmentCreationResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `department '${departmentName}' created successfully`
        ),
      });
      // to reaload all departments
      departmentControllers.getAllDepartment(
        data,
        socket,
        io,
        "department:all"
      );
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

  //   get department details by department id

  async getDepartmentById(data, socket, io, currentRoute) {
    try {
      const { departmentId = false } = data;

      if (!departmentId || departmentId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      //   fetch department by id
      let departmentResult = await MasterDepartmentModel.findOne({
        where: {
          id: departmentId,
        },
      });
      if (!departmentResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "department not found",
            currentRoute,
            "department not found"
          ),
        });
      }
      departmentResult = jsonFormator(departmentResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Department fetched successfully",
          currentRoute,
          departmentResult
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async updateDepartment(data, socket, io, currentRoute) {
    try {
      const dptSchema = Yup.object({
        departmentId: Yup.number(customMessage.badReq).required(
          customMessage.badReq
        ),
        departmentName: Yup.string("invalid department name").required(
          "please enter department name"
        ),
        priorityLevel: Yup.string()
          .oneOf(
            ["permanent", "temporary"],
            "Please select role's priority level like , permanent or temporary"
          )
          .required("priority level is required !"),
      });

      const { departmentId, departmentName, priorityLevel } =
        await dptSchema.validate(data);

      //   fetch department by id
      let departmentResult = await MasterDepartmentModel.findOne({
        where: {
          id: departmentId,
        },
      });
      if (!departmentResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "Department not found", currentRoute),
        });
      }

      departmentResult = jsonFormator(departmentResult);

      if (!departmentResult.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Department  '${departmentResult?.name}' can't be modified !`
          ),
        });
      }
      //   update department
      let updateResult = await MasterDepartmentModel.update(
        {
          name: departmentName,
          is_deletable: priorityLevel == "permanent" ? false : true,
        },
        {
          where: {
            id: departmentId,
          },
        }
      );

      // up department not updated

      if (!updateResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Department '${departmentName}' not updated `,
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `The department ` + customMessage.updSucc,
          currentRoute
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  //   delete department
  async deleteDepartment(data, socket, io, currentRoute) {
    try {
      const { departmentId = false } = data;
      if (!departmentId || departmentId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      //   fetch sub-menu by id
      let departmentResult = await MasterDepartmentModel.findOne({
        where: {
          id: departmentId,
        },
      });
      if (!departmentResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Department Does Not Exist",
            currentRoute,
            "Submenu not found"
          ),
        });
      }

      departmentResult = jsonFormator(departmentResult);

      // if  department is not  deletable
      if (!departmentResult?.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Department '${departmentResult?.name}'  cannot be deleted !`,
            currentRoute
          ),
        });
      }

      // change status

      const [isDeleted] = await MasterDepartmentModel.update(
        {
          status: false,
        },
        {
          where: {
            id: departmentId,
          },
        }
      );
      if (!isDeleted) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Department '${departmentResult?.name}' not deleted ! `,
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Department '${departmentResult.name}' has been deleted successfully !`,
          currentRoute
        ),
      });
      // to reaload all departments
      departmentControllers.getAllDepartment(
        data,
        socket,
        io,
        "department:all"
      );
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};

export default MasterDepartmentModelControllers;
