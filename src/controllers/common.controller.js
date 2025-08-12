/* eslint-disable no-unused-vars */
import { InfoApprovals } from "../model/infoApproval.model.js";
import { apiResponse } from "../utility/response.util.js";
import { QualityApprovalManagerWithAdmin } from "../model/qualityApprovalMngAd.model.js";
import moment from "moment";
import { jsonFormator } from "../utility/toJson.util.js";
import Yup from "yup";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
import { sequelize } from "../config/dbConfig.js";
import { customMessage } from "../utility/messages.util.js";
import { VkInfoApprovalVkQualityApprovalMng } from "../model/views/infoApprovalView.model.js";
import VkQulityApprovalMngAdm from "../model/views/QulityApprovalMngAdmView.model.js";
const commonControllers = {
    // get all product in database
    async insertApprovalForManagerAdmin(
        data,
        transaction,
        socket,
        io,
        currentRoute
    ) {
        try {
            var CerDat = moment().format("YYYY-MM-DD");
            let insertdata = await QualityApprovalManagerWithAdmin.create(
                {
                    product_id: data?.product_id,
                    quantity: data?.quantity,
                    unit_id: data?.unit_id,
                    vendor_id: data?.vendorId,
                    priceper_unit: data?.pricePerUnit ?? 0,
                    db_table_name: data?.db_table_name, // (in table) source table name  Ex from where entry is comming
                    send_db_table_name: data?.send_db_table_name, // (send table)
                    db_table_id: data?.db_table_id,
                    ms_product_type_id: data?.productTypeId ?? 1, //newly added
                    master_packing_size_id: data?.packingSizeId ?? 0, //newly added
                    in_departmenthead_id: data?.in_departmenthead_id,
                    in_department_id: data?.in_department_id,
                    dist_center_id: data?.dist_center_id ?? 0,
                    send_department_id: data?.send_department_id,
                    send_departmenthead_id: data?.send_departmenthead_id,
                    bill_image: data?.billImage ?? null,
                    approval_status_by_destination: 1,
                    created_by: data?.created_by,
                    entry_type_id: data?.entry_type_id,
                    date: data.date ?? sequelize.literal("CURRENT_TIMESTAMP")
                },
                { transaction }
            );
            insertdata = jsonFormator(insertdata);
            return insertdata;
        } catch (error) {
            //   socket.emit("error", {
            //     ...apiResponse.error(false, error.message, currentRoute, error),
            //   });
            console.log("ERROR =>", error);
            //   await transaction.rollback();
            throw new Error("Failed to insert into ApprovalForManagerAdmin ", error);
        }
    },
    async updateApprovalForManagerAdmin(
        data,
        transaction,
        tableName,
        tableInserId,
        socket,
        io,
        currentRoute
    ) {
        try {
            // console.log("QualityApprovalManagerWithAdmin ", data);
            let [updateResult] = await QualityApprovalManagerWithAdmin.update(
                {
                    vendorId: data?.vendorId,
                    product_id: data?.product_id,
                    quantity: data?.quantity,
                    rejected_quantity: 0.00,
                    unit_id: data?.unit_id,
                    priceper_unit: data?.pricePerUnit ?? 0,
                    db_table_name: data?.db_table_name,
                    db_table_id: data?.db_table_id,
                    in_departmenthead_id: data?.in_departmenthead_id,
                    in_department_id: data?.in_department_id,
                    send_department_id: data?.send_department_id,
                    send_db_table_name: data?.send_db_table_name,
                    send_departmenthead_id: data?.send_departmenthead_id,
                    bill_image: data?.billImage,
                    created_by: data?.created_by,
                    updated_by: socket?.user?.id,
                    updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                    ms_product_type_id: data?.productTypeId, //newly added
                    master_packing_size_id: data?.packingSizeId ?? 0, //newly added
                },
                {
                    where: {
                        db_table_name: data?.db_table_name,
                        db_table_id: tableInserId,
                    },
                    transaction,
                }
            );
            console.log("admin update result =>", updateResult)
            return updateResult;
        } catch (error) {
            //   socket.emit("error", {
            //     ...apiResponse.error(false, error.message, currentRoute, error),
            //   });
            //   return error.message;
            //   await transaction.rollback();
            //console.error("Error at update in big table");
            throw new Error("Failed to update  into ApprovalForManagerAdmin");
        }
    },
    // update status of entry in admin approval table incase entry is deleted from department table
    async deleteApprovalForManagerAdmin(data,
        transaction,
        socket,
        io,
        currentRoute) {
        try {
            const [deleteResult] = await QualityApprovalManagerWithAdmin.update({
                status: 0,
                updated_by: socket?.user?.id,
                updated_on: sequelize.literal('CURRENT_TIMESTAMP'),
            }, {
                where: {
                    ...data
                },
                transaction
            })
            console.log("admin delete result =>", deleteResult)
            return deleteResult ? true : false;
        } catch (error) {
            console.log("ERROR =>", error)
            throw new Error("Failed to insert into ApprovalForManagerAdmin ", error);
        }
    }
    , async adminReturnDetails(data, socket, io, currentRoute) {
        try {
            const { isAdmin = false, department_id: currentDptId } = socket.user;
            const { id } = await idSchema.validate(data);
            // get details from admin tabel fro the admin return entry
            let returnData = await VkQulityApprovalMngAdm.findByPk(id);
            if (!returnData) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "details not found", currentRoute) })
            }
            returnData = jsonFormator(returnData)
            const { send_db_table_name, send_department_id: sourceDpt, admin_table_ref_id } = returnData;
            // check wther user it blogns to department which have sent this stock out request or admin
            if (currentDptId !== sourceDpt && !isAdmin) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.unauthorized, currentRoute) })
            }
            console.log("Return data =>", returnData);
            let stockOutData = await VkQulityApprovalMngAdm.findByPk(admin_table_ref_id);
            if (!stockOutData) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "stock out details not found", currentRoute) })
            }
            stockOutData = jsonFormator(stockOutData);
            console.log("stockOutData =>", stockOutData)
            const res = {
                returDetails: returnData,
                stockOutDetails: stockOutData
            }
            socket.emit(currentRoute, { ...apiResponse.success(true, "return details fetched successfully", currentRoute, res) })
        } catch (error) {
            console.log("Error =>", error)
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error.message),
            });
        }
    }
    // async viewbyId(data, socket, io, currentRoute) {
    //     try {
    //         const alertDt = await alert.update({ ViewStatus: 0 },
    //             { where: { id: data.id } });
    //         const alertdetails = await InfoAlert.findAll({
    //             where: {
    //                 userid: socket.user.id,
    //             }
    //         });
    //         const alertCount = await InfoAlert.count({
    //             where: {
    //                 ViewStatus: 1,
    //             }
    //         });
    //         socket.emit("alert:getbyuserId", {
    //             ...apiResponse.success(
    //                 true,
    //                 "product data",
    //                 currentRoute,
    //                 { alertdetails, alertCount }
    //             ),
    //         });
    //     } catch (error) {
    //         console.error("error =>", error);
    //         socket.emit("error", {
    //             ...apiResponse.error(false, error.message, currentRoute, error),
    //         });
    //     }
    // },
};
export default commonControllers;

