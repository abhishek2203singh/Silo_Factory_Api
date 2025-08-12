/ eslint-disable no-unused-vars /
import Yup from "yup";
import { apiResponse } from "../utility/response.util.js";
import { customMessage } from "../utility/messages.util.js";
import { jsonFormator } from "../utility/toJson.util.js";
import moment from "moment";
import { OthereDepartmentModel } from "../model/otherDepartment.model.js";
import { sequelize } from "../config/dbConfig.js";
import { Op } from "sequelize";
import { OthereDepartmentUpdateModel } from "../model/otherDepartmentUpdate.model.js";
import commonControllers from "./common.controller.js";
import { changeDetector } from "../utility/changeDetector.util.js";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
import { departmentEntrySchema } from "../yup-schemas/departmentEntry.schema.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import { OtherDepartmentViewModal } from "../model/views/otherDepartmentView.js";
import { MasterEntryTypeModel } from "../model/masterEntryType.model.js";
import { BroadcastMethod } from "../Common/Broadcast.js";
const otherDepartmentControllers = {
    // to fech all data from product departments table according to department id
    async getAllDataAccordingToDepartmentId(data, socket, io, currentRoute) {
        try {
            // get all data accordint to department id
            let result = await OtherDepartmentViewModal.findAll({
                attributes: {
                    exclude: [
                        "updated_by",
                        "updated_at",
                        "db_table_name",
                        "db_table_id",
                    ],
                },
                where: { created_by: socket.user.id, status: true },
                order: [["created_on", "DESC"]]
            });
            result = jsonFormator(result);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "All data for product departments" + customMessage.fetched,
                    currentRoute,
                    result
                ),
            });
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
    // other department by id
    async getDepartmentById(data, socket, io, currentRoute) {
        try {
            const { otherDepartId = false } = data;
            if (!otherDepartId || otherDepartId < 1) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute),
                });
            }
            let othDepartData = await OthereDepartmentModel.findOne({
                where: {
                    id: otherDepartId,
                },
            });
            if (!othDepartData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Department not Found!!",
                        currentRoute,
                        "Department not Found!!"
                    ),
                });
            }
            othDepartData = jsonFormator(othDepartData);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Department fetched successfully!!",
                    currentRoute,
                    othDepartData
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    // to add a new entery
    async addNewEntry(data = {}, socket, io, currentRoute) {
        try {
            console.table(data)
            const {
                entryType,
                productId,
                unitId,
                quantity,
                departmentId,
                departmentHead,
                packingSizeId,
                productTypeId,
            } = await departmentEntrySchema.validate(data, {
                abortEarly: true,
                stripUnknown: true,
            });
            const entryName = jsonFormator(await MasterEntryTypeModel.findByPk(entryType))?.name;
            console.log("entry name =>", entryName);
            if (entryType !== 2) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.useAnother + ` ${entryName}`) })
            }
            // check if  department exists
            let departmentDetails = await MasterDepartmentModel.findByPk(
                departmentId,
                {
                    where: {
                        status: true,
                    },
                }
            );
            // if department not found
            if (!departmentDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Department" + customMessage.notEx,
                        currentRoute,
                        ""
                    ),
                });
            }
            const { table_name } = jsonFormator(departmentDetails);
            //  console.log("departmentDetails =>", table_name);
            let nextId = await OthereDepartmentModel.max("id");
            nextId = nextId == null ? 1 : nextId + 1;
            //   check wether entry already exists
            const startOfDay = moment().startOf("day");
            const endOfDay = moment().endOf("day");
            //   const startOfDay = moment().startOf("day").format("YYYY-MM-DD:HH:MM:SS");
            //   const endOfDay = moment().endOf("day").format("YYYY-MM-DD:HH:MM:SS");
            const isExists = await OthereDepartmentModel.findOne({
                where: {
                    entry_type_id: entryType,
                    product_id: productId,
                    unit_id: unitId,
                    quantity: parseFloat(quantity).toFixed(2),
                    department_id: departmentId, // id of destination department
                    departmenthead_id: departmentHead, //id of destination department head ,
                    current_department_id: socket?.user?.department_id, // id of source/ current departmetn id
                    date: {
                        [Op.between]: [startOfDay, endOfDay],
                    },
                    db_table_name: table_name,
                },
            });
            //   in case of duplicate entry
            // console.log("exists result =>", isExists);
            if (isExists) {
                return socket.emit(currentRoute, {
                    success: false,
                    message: customMessage.dup,
                    currentRoute,
                });
            }
            const transaction = await sequelize.transaction();
            try {
                // insert data in other-department table
                let insertResult = await OthereDepartmentModel.create(
                    {
                        entry_type_id: entryType,
                        product_id: productId,
                        unit_id: unitId,
                        quantity: parseFloat(quantity).toFixed(2),
                        department_id: departmentId, // id of destination department
                        departmenthead_id: departmentHead, //id of destination department head ,
                        current_department_id: socket?.user?.department_id, // id of source/ current departmetn id
                        db_table_name: table_name,// table name of destination department
                        ms_product_type_id: productTypeId,
                        master_packing_size_id: packingSizeId,
                        db_table_id: nextId,
                        created_by: socket.user.id,
                    },
                    { transaction }
                );
                if (!insertResult) {
                    throw new Error("error while inserting ");
                }
                insertResult = jsonFormator(insertResult);
                // inserted id of other department table
                const insertId = insertResult.id;
                delete insertResult.id;
                //   if entry inserted sucessfully in other-department then also insert in (other-department_update) table
                const secondInsertResult = await OthereDepartmentUpdateModel.create(
                    {
                        ...insertResult,
                        ref_table_id: insertId,
                        activity: "New",
                        // pasteurization_department_id: insertId,
                    },
                    { transaction }
                );
                if (!secondInsertResult) {
                    throw new Error(
                        "Error in creating second entry in other_department_update table =>"
                    );
                }
                const details = {
                    product_id: productId,
                    quantity: quantity,
                    unit_id: unitId,
                    pricePerUnit: 0,
                    db_table_name: "Other_Department",
                    send_db_table_name: table_name,
                    db_table_id: insertId,
                    in_departmenthead_id: socket.user.id,
                    in_department_id: socket.user.department_id,
                    send_department_id: departmentId,
                    send_departmenthead_id: departmentHead,
                    ms_product_type_id: productTypeId,
                    master_packing_size_id: packingSizeId,
                    entry_type_id: insertResult?.entry_type_id,
                    bill_image: null,
                    created_by: socket.user.id,
                };
                const insertInAdminApproval =
                    await commonControllers.insertApprovalForManagerAdmin(
                        details,
                        transaction,
                        socket,
                        io,
                        currentRoute
                    );
                //   TODO: add notifications for all
                if (!insertInAdminApproval) {
                    throw new Error("error while inserting ");
                }
                await transaction.commit();
                // broad cast to admin
                BroadcastMethod.broadcastToAllRequiredClients({}, socket,
                    io, currentRoute
                )
                return socket.emit(currentRoute, {
                    ...apiResponse.success(
                        true,
                        "Entry added successfully",
                        currentRoute
                    ),
                });
            } catch (error) {
                console.error("ERROR  while inserting =>", error);
                await transaction.rollback();
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
            //   insert the same data in
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
            console.error("Error =>", error)
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    //   to update an existing entry
    async updateEntry(data, socket, io, currentRoute) {
        try {
            const updateSchema = departmentEntrySchema.concat(idSchema);
            const {
                entryType,
                productId,
                unitId,
                quantity,
                departmentId,
                departmentHead,
                packingSizeId,
                productTypeId,
                id,
            } = await updateSchema.validate(data);
            const entryName = jsonFormator(await MasterEntryTypeModel.findByPk(entryType))?.name;
            console.log("entry name =>", entryName);
            if (entryType !== 2) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.useAnother + `( ${entryName})`) })
            }
            let departmentDetails = await MasterDepartmentModel.findByPk(
                departmentId
            );
            //   if department not exits
            if (!departmentDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Department " + customMessage.notEx,
                        currentRoute,
                        ""
                    ),
                });
            }
            // check if  department exists
            const { table_name } = jsonFormator(departmentDetails);
            //   const get entry data by id
            let isExists = await OthereDepartmentModel.findOne({
                attributes: [
                    "entry_type_id",
                    "product_id",
                    "unit_id",
                    "quantity",
                    "department_id",
                    "departmenthead_id",
                    "db_table_name",
                ],
                where: {
                    status: true,
                    id,
                },
            });
            if (!isExists) {
                return socket.emit(currentRoute, {
                    success: false,
                    message: customMessage.notFound,
                    currentRoute,
                });
            }
            isExists = jsonFormator(isExists);
            if (isExists.approval_status_id == 3) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        customMessage.approvedCantModify,
                        currentRoute,
                        []
                    ),
                });
            }
            // check wither if anything is changed
            const change = {
                entry_type_id: entryType,
                product_id: productId,
                unit_id: unitId,
                quantity: Number(quantity),
                department_id: departmentId,
                departmenthead_id: departmentHead,
                ms_product_type_id: productTypeId,
                master_packing_size_id: packingSizeId,
                db_table_name: table_name,
            };
            //   convert quantity in float
            isExists.quantity = parseFloat(isExists.quantity);
            const hasChanges = changeDetector(isExists, change);
            //   in case of no change
            if (!hasChanges) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.noChange, currentRoute),
                });
            }
            // transaction start *********************************************
            const transaction = await sequelize.transaction();
            try {
                // update in pasteurization_department table
                const [upadateResult] = await OthereDepartmentModel.update(
                    {
                        entry_type_id: entryType,
                        product_id: productId,
                        unit_id: unitId,
                        departmenthead_id: departmentHead,
                        department_id: departmentId,
                        quantity: parseFloat(quantity).toFixed(2),
                        db_table_name: table_name,
                        db_table_id: id,
                        ms_product_type_id: productTypeId,
                        master_packing_size_id: packingSizeId,
                        updated_by: socket.user.id,
                        updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                    },
                    {
                        where: {
                            id,
                        },
                        transaction,
                    }
                );
                if (!upadateResult) {
                    //  console.log("update result =>", upadateResult);
                    throw new Error("error while updating ");
                }
                const secondInsertResult = await OthereDepartmentUpdateModel.create(
                    {
                        entry_type_id: entryType,
                        ref_table_id: id,
                        product_id: productId,
                        unit_id: unitId,
                        quantity: quantity,
                        departmenthead_id: departmentHead,
                        department_id: departmentId,
                        db_table_name: table_name,
                        ms_product_type_id: productTypeId,
                        master_packing_size_id: packingSizeId,
                        db_table_id: id,
                        created_by: socket.user.id,
                        activity: "update",
                        // pasteurization_department_id: insertId,
                    },
                    { transaction }
                );
                //   insert entry in update table
                if (!secondInsertResult) {
                    throw new Error(
                        "Error in creating second entry in pasteurization-department_update table =>"
                    );
                }
                const details = {
                    product_id: productId,
                    quantity: quantity,
                    unit_id: unitId,
                    pricePerUnit: 0,
                    db_table_name: "Other_Department",
                    send_db_table_name: table_name,
                    db_table_id: id,
                    in_departmenthead_id: socket.user.id,
                    in_department_id: socket.user.department_id,
                    ms_product_type_id: productTypeId,
                    master_packing_size_id: packingSizeId,
                    send_department_id: departmentId,
                    send_departmenthead_id: departmentHead,
                    entry_type_id: entryType,
                    bill_image: null,
                    created_by: socket.user.id,
                };
                // update data in admin  table
                const updated = await commonControllers.updateApprovalForManagerAdmin(
                    details,
                    transaction,
                    table_name,
                    id,
                    socket,
                    io,
                    currentRoute
                );
                // console.log("admin update result =>", updated);
                //   TODO: add notifications for all
                if (!updated) {
                    throw new Error("Error in updateApprovalForManagerAdmin ");
                }
                await transaction.commit();
                // broad cast to admin
                BroadcastMethod.broadcastToAllRequiredClients({}, socket,
                    io, currentRoute
                )
                socket.emit(currentRoute, {
                    ...apiResponse.success(true, customMessage.updSucc, currentRoute),
                });
                return this.getAllDataAccordingToDepartmentId(
                    data,
                    socket,
                    io,
                    "other-dpt:all"
                );
            } catch (error) {
                console.error("ERROR  while inserting =>", error);
                await transaction.rollback();
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
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
    async deleteEntry(data, socket, io, currentRoute) {
        try {
            const { id } = await idSchema.validate(data);
            // Find the record by ID
            let record = await OthereDepartmentModel.findOne({
                where: { id, status: 1, created_by: socket.user.id },
            });
            if (!record) {
                socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Entry " + customMessage.notEx,
                        currentRoute,
                        []
                    ),
                });
                return;
            }
            const previousRecord = record;
            // record = jsonFormator(record);
            console.log("record =>", record)
            const { db_table_name } = record;
            if (record.approval_status_id == 3) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        customMessage.approvedCantDelete,
                        currentRoute,
                        []
                    ),
                });
            }
            const transaction = await sequelize.transaction();
            try {
                // Perform the soft delete by updating the status to 0
                await previousRecord.update({ status: 0, updated_by: socket.user.id, updated_on: sequelize.literal('CURRENT_TIMESTAMP') }, { transaction });
                let data = await previousRecord.save({ transaction });
                data = jsonFormator(data);
                console.log("delete =>", data);
                if (data.status) {
                    throw new Error("Failed to change status to 0");
                }
                const refrenceId = data.id;
                delete data.id;
                const insertResult = await OthereDepartmentUpdateModel.create(
                    {
                        ...data,
                        ref_table_id: refrenceId,
                        payment_status_by: data.payment_status_to_vendor,
                        activity: "delete",
                        created_by: socket.user.id,
                    },
                    { transaction }
                );
                if (!insertResult) {
                    throw new Error("Failed to insert in update table");
                }
                // update status in admin table
                const adminDeleteResult = await commonControllers.deleteApprovalForManagerAdmin({ send_db_table_name: db_table_name, db_table_id: id, created_by: socket.user.id }, transaction, socket, io, currentRoute);
                if (!adminDeleteResult) {
                    throw new Error("Error in deleteApprovalForManagerAdmin");
                }
                await transaction.commit();
                // broad cast to admin
                BroadcastMethod.broadcastToAllRequiredClients({}, socket,
                    io, currentRoute
                )
                return socket.emit(currentRoute, {
                    ...apiResponse.success(true, customMessage.delSucc, currentRoute),
                });
            } catch (error) {
                console.error("Error during deletion:", error);
                await transaction.rollback();
                socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
            //   socket.emit(currentRoute, {
            //     ...apiResponse.success(true, customMessage.delSucc, currentRoute, {
            //       id,
            //     }),
            //   });
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
            // console.error("Error during deletion:", error);
            socket.emit("error", {
                ...apiResponse.error(
                    false,
                    error.messagge,
                    currentRoute,
                    error.message
                ),
            });
        }
    },
    async getAllEntries(data, socket, io, currentRoute) {
        try {
            let allEntries = await OthereDepartmentModel.findAll({
                order: [["created_on", "DESC"]],
            });
            jsonFormator(allEntries);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    customMessage.fetchedcurrentRoute,
                    currentRoute,
                    allEntries
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
};
export default otherDepartmentControllers;

