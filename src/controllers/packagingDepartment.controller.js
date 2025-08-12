import { Op } from "sequelize";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
import { PackagingDptModel } from "../model/packagingDpt.model.js";
import { PackagingDptUpdateModel } from "../model/packagingDptUpdate.model.js";
import { customMessage } from "../utility/messages.util.js";
import { apiResponse } from "../utility/response.util.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { departmentEntrySchema } from "../yup-schemas/departmentEntry.schema.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import commonControllers from "./common.controller.js";
import moment from "moment";
import { sequelize } from "../config/dbConfig.js";
import Yup from "yup";
import { changeDetector } from "../utility/changeDetector.util.js";
import { PackagingDepartmentViewModel } from "../model/views/packagingDepartmentView.model.js";
import { ProductModel } from "../model/product.model.js";
import { BroadcastMethod } from "../Common/Broadcast.js";
import { MasterEntryTypeModel } from "../model/masterEntryType.model.js";
const packagingDptControllers = {
    async addNewEntry(data = {}, socket, io, currentRoute) {
        try {
            departmentEntrySchema;
            const {
                entryType,
                productId,
                quantity,
                unitId,
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
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.useAnother + `( ${entryName})`) })
            }
            // check if entry already exists
            let departmentDetails = await MasterDepartmentModel.findByPk(
                departmentId
            );
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
            //   find product details by product id
            const productDetails = await ProductModel.findOne({
                where: {
                    id: productId,
                    status: true
                }
            })
            if (!productDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Product" + customMessage.notEx + "or disabled",
                        currentRoute,
                        ""
                    ),
                });
            }
            // const { unitId } = productDetails;
            // check if  department exists
            const { table_name } = jsonFormator(departmentDetails);
            console.log("departmentDetails =>", table_name);
            let nextId = await PackagingDptModel.max("id");
            nextId = nextId == null ? 1 : nextId + 1;
            //   check wether entry already exists
            const startOfDay = moment().startOf("day");
            const endOfDay = moment().endOf("day");
            const isExists = await PackagingDptModel.findOne({
                where: {
                    entry_type_id: entryType,
                    product_id: productId,
                    unit_id: unitId,
                    quantity: quantity,
                    ms_product_type_id: productTypeId,
                    master_packing_size_id: packingSizeId,
                    date: {
                        [Op.between]: [startOfDay, endOfDay],
                    },
                    db_table_name: table_name,
                },
            });
            //   in case of duplicate entry
            if (isExists) {
                return socket.emit(currentRoute, {
                    success: false,
                    message: customMessage.dup,
                    currentRoute,
                });
            }
            const transaction = await sequelize.transaction();
            try {
                // insert data in Packaging-department table
                let insertResult = await PackagingDptModel.create(
                    {
                        entry_type_id: entryType,
                        product_id: productId,
                        unit_id: packingSizeId ? 5 : unitId,
                        quantity: quantity,
                        department_id: departmentId,
                        departmenthead_id: departmentHead,
                        db_table_name: table_name,
                        db_table_id: nextId,
                        created_by: socket.user.id,
                        ms_product_type_id: productTypeId,
                        master_packing_size_id: packingSizeId,
                    },
                    { transaction }
                );
                if (!insertResult) {
                    throw new Error("error while inserting ");
                }
                insertResult = jsonFormator(insertResult);
                // inserted id of Packaging_departement table
                const insertId = insertResult.id;
                delete insertResult.id;
                //   if entry inserted sucessfully in Packaging-department then also insert in (packaging-department_update) table
                const secondInsertResult = await PackagingDptUpdateModel.create(
                    {
                        ...insertResult,
                        ref_table_id: insertId,
                        activity: "New",
                    },
                    { transaction }
                );
                if (!secondInsertResult) {
                    throw new Error(
                        "Error in creating second entry in Packaging-department_update table =>"
                    );
                }
                const details = {
                    product_id: productId,
                    quantity: quantity,
                    unit_id: unitId,
                    pricePerUnit: 0,
                    db_table_name: "Packaging_Department",
                    send_db_table_name: table_name,
                    db_table_id: insertId,
                    in_departmenthead_id: socket.user.id,
                    in_department_id: socket.user.department_id,
                    send_department_id: departmentId,
                    send_departmenthead_id: departmentHead,
                    entry_type_id: insertResult?.entry_type_id,
                    bill_image: null,
                    created_by: socket.user.id,
                    master_packing_size_id: packingSizeId,
                    ms_product_type_id: productTypeId
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
                socket.emit(currentRoute, {
                    ...apiResponse.success(
                        true,
                        "Entry added successfully",
                        currentRoute
                    ),
                });
                this.getAllEntries(data, socket, io, "packaging-dpt:all");
                BroadcastMethod.broadcastToAllRequiredClients({}, socket,
                    io, currentRoute
                )
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
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getEntryById(data, socket, io, currentRoute) {
        try {
            const { id } = await idSchema.validate(data);
            let result = await PackagingDptModel.findOne({
                where: { id, status: true },
            });
            if (!result) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Record " + customMessage.notEx,
                        currentRoute,
                        ""
                    ),
                });
            }
            result = jsonFormator(result);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    customMessage.fetched,
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
    async updateEntry(data, socket, io, currentRoute) {
        try {
            const updateSchema = departmentEntrySchema.concat(idSchema);
            const {
                entryType,
                productId,
                quantity,
                unitId,
                departmentId,
                departmentHead,
                packingSizeId,
                productTypeId,
                id,
            } = await updateSchema.validate(data);
            let departmentDetails = await MasterDepartmentModel.findByPk(
                departmentId
            );
            const entryName = jsonFormator(await MasterEntryTypeModel.findByPk(entryType))?.name;
            console.log("entry name =>", entryName);
            if (entryType != 2) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.useAnother + ` ${entryName}`) })
            }
            //   find product details by product id
            const productDetails = await ProductModel.findOne({
                where: {
                    id: productId,
                    status: true
                }
            })
            if (!productDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Product" + customMessage.notEx + " or disabled",
                        currentRoute,
                        ""
                    ),
                });
            }
            // const { unitId } = productDetails;
            // If department does not exist
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
            // Check if department exists
            const { table_name } = jsonFormator(departmentDetails);
            // Get entry data by id
            let isExists = await PackagingDptModel.findOne({
                attributes: [
                    "entry_type_id",
                    "product_id",
                    "unit_id",
                    "quantity",
                    "department_id",
                    "departmenthead_id",
                    "db_table_name",
                    "approval_status_id",
                    "ms_product_type_id",
                    "master_packing_size_id",
                ],
                where: {
                    id,
                    status: true,
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
            if (isExists?.approval_status_id == 3) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        customMessage.approvedCantModify,
                        currentRoute,
                        []
                    ),
                });
            }
            // Check whether anything has changed
            const change = {
                entry_type_id: entryType,
                product_id: productId,
                unit_id: packingSizeId ? 5 : unitId,//if packing size is selected then unit will be pcs else according to selected unit
                quantity: Number(quantity),
                department_id: departmentId,
                departmenthead_id: departmentHead,
                db_table_name: table_name,
                ms_product_type_id: productTypeId,
                master_packing_size_id: packingSizeId,
            };
            // Convert quantity to float
            isExists.quantity = parseFloat(isExists.quantity);
            const hasChanges = changeDetector(isExists, change);
            // In case of no change
            if (!hasChanges) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.noChange, currentRoute),
                });
            }
            // Transaction start *********************************************
            const transaction = await sequelize.transaction();
            try {
                // Update in Packaging_department table
                const [updateResult] = await PackagingDptModel.update(
                    {
                        entry_type_id: entryType,
                        product_id: productId,
                        unit_id: unitId,
                        quantity: parseFloat(quantity).toFixed(2),
                        db_table_name: table_name,
                        department_id: departmentId,
                        departmenthead_id: departmentHead,
                        ms_product_type_id: productTypeId,
                        master_packing_size_id: packingSizeId,
                        db_table_id: id,
                        updated_by: socket.user.id,
                        updated_at: Date.now(),
                    },
                    {
                        where: {
                            id,
                        },
                        transaction,
                    }
                );
                if (!updateResult) {
                    console.log("update result =>", updateResult);
                    throw new Error("Error while updating");
                }
                // Insert the copy of current data in [Packaging_Department_Update] table
                const secondInsertResult = await PackagingDptUpdateModel.create(
                    {
                        entry_type_id: entryType,
                        ref_table_id: id,
                        product_id: productId,
                        unit_id: unitId,
                        quantity: quantity,
                        department_id: departmentId,
                        departmenthead_id: departmentHead,
                        ms_product_type_id: productTypeId,
                        master_packing_size_id: packingSizeId,
                        db_table_name: table_name,
                        db_table_id: id,
                        created_by: socket.user.id,
                        activity: "update",
                        approval_status_id: isExists.approval_status_id, // Add approval_status_id to prevent null value error
                    },
                    { transaction }
                );
                // Insert entry in update table
                if (!secondInsertResult) {
                    throw new Error(
                        "Error in creating second entry in Packaging_Department_Update table =>"
                    );
                }
                const details = {
                    product_id: productId,
                    quantity: quantity,
                    unit_id: unitId,
                    pricePerUnit: 0,
                    db_table_name: "Packaging_Department",
                    send_db_table_name: table_name,
                    db_table_id: id,
                    in_departmenthead_id: socket.user.id,
                    ms_product_type_id: productTypeId,
                    master_packing_size_id: packingSizeId,
                    in_department_id: socket.user.department_id,
                    send_department_id: departmentId,
                    send_departmenthead_id: departmentHead,
                    entry_type_id: entryType,
                    bill_image: null,
                    created_by: socket.user.id,
                };
                // Update data in admin table
                const updated = await commonControllers.updateApprovalForManagerAdmin(
                    details,
                    transaction,
                    table_name,
                    id,
                    socket,
                    io,
                    currentRoute
                );
                console.log("admin update result =>", updated);
                // TODO: Add notifications for all
                if (!updated) {
                    throw new Error("Error in updateApprovalForManagerAdmin");
                }
                await transaction.commit();
                // Emit success message when updated successfully
                socket.emit(currentRoute, {
                    ...apiResponse.success(true, customMessage.updSucc, currentRoute),
                    message: "Entry updated successfully.",
                });
                // broad cast to admin
                BroadcastMethod.broadcastToAllRequiredClients({}, socket,
                    io, currentRoute
                )
                return this.getAllEntries(data, socket, io, "packaging-dpt:all");
            } catch (error) {
                console.error("ERROR while inserting =>", error);
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
            if (!id) {
                console.error("ID not provided in data:", id);
                socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute, []),
                });
                return;
            }
            // Find the record by ID
            let record = await PackagingDptModel.findOne({
                where: { id, status: true },
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
            //   to stor record in to a variable for further use
            const previousRecord = record;
            record = jsonFormator(record);
            //   to check if entry is approved can it can't be modified / deleted
            if (record?.approval_status_id == 3) {
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
                const { db_table_name } = data
                if (data.status) {
                    throw new Error("Failed to change status to 0");
                }
                const refrenceId = data.id;
                delete data.id;
                const insertResult = await PackagingDptUpdateModel.create(
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
                socket.emit(currentRoute, {
                    ...apiResponse.success(true, customMessage.delSucc, currentRoute),
                });
                // broad cast to admin
                BroadcastMethod.broadcastToAllRequiredClients({}, socket,
                    io, currentRoute
                )
                return this.getAllEntries(data, socket, io, "packaging-dpt:all");
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
            console.error("Error during deletion:", error);
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
            let allEntries = await PackagingDepartmentViewModel.findAll({
                where: {
                    packidStatus: true,
                },
                order: [["created_on", "DESC"]],
            });
            allEntries = jsonFormator(allEntries);
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
export default packagingDptControllers;

