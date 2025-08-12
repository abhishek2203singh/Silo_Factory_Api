import Yup from "yup";
import { MasterPaymentStatusModal } from "../../model/masterPaymentStatus.modal.js";
import { apiResponse } from "../../utility/response.util.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { customMessage } from "../../utility/messages.util.js";
const masterPaymentStatusController = {
  async createPaymentStatus(data, socket, io, currentRoute) {
    try {
      const payTStatusSchema = Yup.object({
        payStatusName: Yup.string().required(
          "Please, enter payment status name!!"
        ),
        priorityLevel: Yup.string()
          .oneOf(
            ["permanent", "temporary"],
            "Please select state priority level like , permanent or temporary"
          )
          .required("Priority Level is required.!")
          .default("temporary"),
      });
      const { payStatusName, priorityLevel } = await payTStatusSchema.validate(
        data
      );
      const ispayTStatusExists = await MasterPaymentStatusModal.findOne({
        where: {
          name: payStatusName,
        },
      });
      if (ispayTStatusExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Payment type ${payStatusName} already exists!!`
          ),
        });
      }
      let paymentStatusResult = await MasterPaymentStatusModal.create({
        name: payStatusName,
        is_deletable: priorityLevel == "permanent" ? false : true,
      });
      if (!paymentStatusResult) {
        socket.emit(currentRoute, {
          ...apiResponse.error(false, "Payment status not created !!"),
        });
      }
      paymentStatusResult = jsonFormator(paymentStatusResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Payment type ${payStatusName} created successfully!!`
        ),
      });
      this.paymentStatusAll(data, socket, io, "ms:payment-status:all");
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async updatePaymentStatus(data, socket, io, currentRoute) {
    try {
      const pyStSchema = Yup.object({
        payStatusId: Yup.number(customMessage.badReq).required(
          customMessage.badReq
        ),
        payStatusName: Yup.string().required(
          "Please, enter payment status name!!"
        ),
        priorityLevel: Yup.string()
          .oneOf(
            ["permanent", "temporary"],
            "Please select state priority level like , permanent or temporary"
          )
          .required("Priority Level is required.!")
          .default("temporary"),
      });
      const { payStatusId, payStatusName, priorityLevel } =
        await pyStSchema.validate(data);
      let isStatusExists = await MasterPaymentStatusModal.findOne({
        where: {
          Id: payStatusId,
        },
      });
      if (!isStatusExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Payment Status not found!!",
            currentRoute
          ),
        });
      }
      isStatusExists = jsonFormator(isStatusExists);
      if (!isStatusExists.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Payment type ${payStatusName} cant't be modified!!`
          ),
        });
      }
      let [updateResult] = await MasterPaymentStatusModal.update(
        {
          name: payStatusName,
          is_deletable: priorityLevel == "permanent" ? false : true,
        },
        {
          where: {
            id: payStatusId,
          },
        }
      );
      if (!updateResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Payment status ${payStatusName} not modified!!`
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Payment Status ${payStatusName} modified successfully!!`
        ),
      });
      this.paymentStatusAll(data, socket, io, "ms:payment-status:all");
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async paymentStatusById(data, socket, io, currentRoute) {
    try {
      const { payStatusId = false } = data;
      if (!payStatusId || payStatusId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      let paymentstatusIdResult = await MasterPaymentStatusModal.findOne({
        where: {
          Id: payStatusId,
        },
      });
      if (!paymentstatusIdResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Payment Status not found!!",
            currentRoute,
            "Payment not found"
          ),
        });
      }
      paymentstatusIdResult = jsonFormator(paymentstatusIdResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Payment Status Fetched successfully!!",
          currentRoute,
          paymentstatusIdResult
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async paymentStatusAll(data, socket, io, currentRoute) {
    try {
      let allPaymentStatusResult = await MasterPaymentStatusModal.findAll({
        order: [["created_on", "DESC"]],
      });
      allPaymentStatusResult = jsonFormator(allPaymentStatusResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "All Status Data Fetched Successfully!!",
          currentRoute,
          allPaymentStatusResult
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};
export default masterPaymentStatusController;
