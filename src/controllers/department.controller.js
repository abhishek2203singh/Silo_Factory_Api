/* eslint-disable no-unused-vars */
import jwt from "jsonwebtoken";
import { apiResponse } from "../utility/response.util.js";
import Yup from "yup";
import { common } from "../Common/common.js";
import { config } from "../config/config.js";
import { response } from "express";
import { tokenFormater } from "../utility/tokenFormat.util.js";
import { UserModel } from "../model/user.model.js";
import { and } from "sequelize";
import { jsonFormator } from "../utility/toJson.util.js";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
import { customMessage } from "../utility/messages.util.js";
const departmentControllers = {
  // get all product in database
  async getAllDepartment(data, socket, io, currentRoute) {
    let condition = {
      where: {
        status: true,
      },
      order: [[["created_on", "DESC"]]],
    };
    try {
      if (socket.user.id == 1) {
        condition = { order: [[["created_on", "DESC"]]] };
      }
      const departmentResult = await MasterDepartmentModel.findAll({
        ...condition,
      });
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "department data",
          currentRoute,
          departmentResult
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error.message),
      });
      //  console.error("error =>", error);
    }
  },
  async getAllDepartmentHead(data, socket, io, currentRoute) {
    const { department_id, role_id } = data;
    try {
      let departmentHeadResult = await UserModel.findAll({
        attributes: [
          "id",
          "full_name",
          "mobile",
          "department_id",
          "role_id",
          "registration_date",
          "status",
          "address",
          "pincode",
          "profile_photo",
          "available_balance",
          "salary",
          "gender",
          "online_status",
          "adhaar_no",
        ],
        where: {
          department_id,
          role_id: role_id,
        },
        order: [[["created_on", "DESC"]]],
      });
      departmentHeadResult = jsonFormator(departmentHeadResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "department data",
          currentRoute,
          departmentHeadResult
        ),
      });
    } catch (error) {
      //   console.error("error =>", error);
    }
  },
};
export default departmentControllers;

