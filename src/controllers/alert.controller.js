/* eslint-disable no-unused-vars */
import Yup from "yup";
import { InfoAlert } from "../model/views/alert.modelView.js";
import { apiResponse } from "../utility/response.util.js";
import { AlertModel } from "../model/alert.model.js";
import { MasterAlertTypeModel } from "../model/masterAlertType.model.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { customMessage } from "../utility/messages.util.js";
const alertControllers = {
  // to get all alters of logged in user
  async getallertBylogId(data, socket, io, currentRoute, id) {
    try {
      const alertdetails = await InfoAlert.findAll({
        where: {
          user_id: id,
        },
      });
      const alertCount = await InfoAlert.count({
        where: {
          ViewStatus: 1,
          user_id: id,
        },
      });
      socket.emit(currentRoute, {
        ...apiResponse.success(true, "Alert", currentRoute, {
          alertdetails,
          alertCount,
        }),
      });
      socket.emit("allalertmessage", {
        ...apiResponse.success(true, "alert", currentRoute, {
          alertdetails,
          alertCount,
        }),
      });
    } catch (error) {
      //console.error("error =>", error);
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async viewbyId(data, socket, io, currentRoute) {
    try {
      const alertDt = await AlertModel.update(
        { ViewStatus: 0 },
        { where: { id: data.id } }
      );
      const alertdetails = await InfoAlert.findAll({
        where: {
          user_id: socket.user.id,
        },
      });
      const alertCount = await InfoAlert.count({
        where: {
          ViewStatus: 1,
          user_id: socket.user.id,
        },
      });
      socket.emit("alert:getbyuserId", {
        ...apiResponse.success(true, "Alert", currentRoute, {
          alertdetails,
          alertCount,
        }),
      });
    } catch (error) {
      //console.error("error =>", error);
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async insertAlert(data, socket, io, currentRoute) {
    try {
      const alertDt = await AlertModel.create({
        get_department_id: data.department_id,
        user_id: data.userid,
        alert_type: data.alerttype,
        message_title: data.messagetitle,
        message: data.message,
        created_by: socket.user.id,
      });
      const alertdetails = await InfoAlert.findAll({
        where: {
          user_id: data.userid,
        },
      });
      const alertCount = await InfoAlert.count({
        where: {
          ViewStatus: 1,
          user_id: data.userid,
        },
      });
      return io.to(data.socketId).emit("alert:getbyuserId", {
        ...apiResponse.success(true, "product data", currentRoute, {
          alertdetails,
          alertCount,
        }),
      });
    } catch (error) {
      //console.error("error =>", error);
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  //   get all alert-types
  async getAllAlertTypes(data, socket, io, currentRoute) {
    try {
      // to filter only active alert types for non-admin user
      // only admin user will get all alert types irrespective of status
      // to exclude deletable alert types for non-admin user
      let condition = {
        attributes: {
          exclude: ["is_deletable", "status"],
        },
        where: {
          status: true,
        },
      };
      //   if user is admin
      if (socket.user.id === 1) {
        condition = { order: [["created_on", "DESC"]], };
      }
      const allAlertTypes = await MasterAlertTypeModel.findAll(condition);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "all alert types fetched successfully",
          currentRoute,
          allAlertTypes
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};
export default alertControllers;

