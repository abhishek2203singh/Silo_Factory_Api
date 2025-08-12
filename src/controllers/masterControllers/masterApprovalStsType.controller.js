import Yup from "yup";
import { apiResponse } from "../../utility/response.util.js";
import { MasterApprovalStatus } from "../../model/masterapprovalStatus.model.js";
import { customMessage } from "../../utility/messages.util.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { MasterApprovalStatusTypeModel } from "../../model/masterApprovelStsType.model.js";
const masterApprovalStatusControllers = {
  // to create a new approval status
  async createApprovelStatusType(data, socket, io, currentRoute) {
    try {
      const approvalStatusSchema = Yup.object({
        name: Yup.string("invalid approval status name").required(
          "please enter approval status name"
        ),
        priorityLevel: Yup.string()
          .oneOf(
            ["permanent", "temporary"],
            "Please select priority level like , permanent or temporary"
          )
          .required("priority level is required !")
          .default("temporary"),
        status: Yup.boolean("please select status").default(true),
      });

      const { name, priorityLevel, status } =
        await approvalStatusSchema.validate(data);
      const existing = await MasterApprovalStatus.findOne({ where: { name } });

      if (existing) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Approval status  ' ${name} '` + customMessage.exists,
            currentRoute,
            ""
          ),
        });
      }
      let createApprovalSts = await MasterApprovalStatus.create({
        name,
        is_deletable: priorityLevel == "permanent" ? false : true,
        status,
      });

      createApprovalSts = jsonFormator(createApprovalSts);

      if (!createApprovalSts) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            true,
            customMessage.creaErr + " approval status",
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Approval status '${name}'` + customMessage.creaSucc,
          currentRoute
        ),
      });
      this.getAllApprovelStatusTypes(
        data,
        socket,
        io,
        "ms-approval-status:all"
      );
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  //   to update an existing approvalstatus
  async updateApprovelStatusType(data, socket, io, currentRoute) {
    try {
      const approvalStatusSchema = Yup.object({
        approvalStsId: Yup.number(customMessage.badReq).required(
          customMessage.badReq
        ),
        name: Yup.string("invalid approval status name").required(
          "please enter approval status name"
        ),
        priorityLevel: Yup.string()
          .oneOf(
            ["permanent", "temporary"],
            "Please select priority level like , permanent or temporary"
          )
          .required("priority level is required !")
          .default("temporary"),
        status: Yup.boolean("please select status").default(true),
      });
      const { approvalStsId, name, status } =
        await approvalStatusSchema.validate(data, {
          abortEarly: true,
          stripUnknown: true,
        });
      let isApprovalStsExists = await MasterApprovalStatusTypeModel.findOne({
        where: { id: approvalStsId },
      });
      // if alert-type not found
      if (!isApprovalStsExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Approval status type " + customMessage.notEx,
            currentRoute
          ),
        });
      }

      // if alert-type can't  be modified

      if (!isApprovalStsExists.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `The apporoval status type '${isApprovalStsExists?.name}' can't be modified !`
          ),
        });
      }
      //   update approval status
      const [updateResult] = await MasterApprovalStatusTypeModel.update(
        {
          name,
          status,
          is_deletable: status == "temporary" ? false : true,
        },
        {
          where: {
            id: approvalStsId,
          },
        }
      );
      //   if approval status not updated in case of updateResult == 0
      if (!updateResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            customMessage.updErr + "approval status type",
            currentRoute
          ),
        });
      }
      //   alert-type updated successfully
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `The alert type  '${isApprovalStsExists?.name}' has been successfully updated to '${name}'`,
          currentRoute
        ),
      });
      //   to reload all alert types
      this.getAllApprovelStatusTypes(
        data,
        socket,
        io,
        "ms-approval-status:all"
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
  //   delete an existing approval status
  async deleteApprovelStatusType(data, socket, io, currentRoute) {
    try {
      const { approvalStsId = false } = data;
      if (!approvalStsId || approvalStsId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      let isApprovalStsExists = await MasterApprovalStatusTypeModel.findOne({
        where: {
          id: approvalStsId,
        },
      });

      //   if approval status not exists

      if (!isApprovalStsExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "approval status type " + customMessage.notEx,
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "approval status type " + customMessage.delSucc
        ),
      });
      // if  department is not  deletable
      if (!isApprovalStsExists?.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Approval status type '${isApprovalStsExists?.name}'  cannot be deleted !`,
            currentRoute
          ),
        });
      }

      // change status

      const [isDeleted] = await MasterApprovalStatusTypeModel.update(
        {
          status: false,
        },
        {
          where: {
            id: approvalStsId,
          },
        }
      );
      if (!isDeleted) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.delErr, currentRoute),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Approval status type  '${isApprovalStsExists.name}' ` +
          customMessage.delSucc,
          currentRoute
        ),
      });
      this.getAllApprovelStatusTypes(
        data,
        socket,
        io,
        "ms-approval-status:all"
      );
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  //   get all approval status
  async getAllApprovelStatusTypes(data, socket, io, currentRoute) {
    try {
      const allApprovalStatus = await MasterApprovalStatusTypeModel.findAll({
        order: [["created_on", "DESC"]],
      });
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "all approval status fetched successfully",
          currentRoute,
          allApprovalStatus
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  //   get a details of a approvals tatus type by id
  async getApprovalStatusTypeById(data, socket, io, currentRoute) {
    try {
      const { approvalStsId = false } = data;
      if (!approvalStsId || approvalStsId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      let isApprovalStsExists = await MasterApprovalStatusTypeModel.findOne({
        where: {
          id: approvalStsId,
        },
      });

      //   if approval status not exists

      if (!isApprovalStsExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "approval status type " + customMessage.notEx,
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Approval status type fetched successfully`,
          currentRoute,
          isApprovalStsExists
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};

export default masterApprovalStatusControllers;
