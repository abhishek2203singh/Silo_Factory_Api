import { customMessage } from "../utility/messages.util.js";
import { apiResponse } from "../utility/response.util.js";
import Yup from "yup";
import { jsonFormator } from "../utility/toJson.util.js";
import { ecommerceEntrySchema } from "../yup-schemas/ecommerceEntry.schema.js";
import { EcommerceDepartmentModel } from "../model/ecommerceDepartment.model.js";
import { sequelize } from "../config/dbConfig.js";
import commonControllers from "./common.controller.js";
import { EcommerceDepartmentUpdateModel } from "../model/ecommerceDepartmentUpdate.model.js";
import { EcommerceDepartmentView } from "../model/views/ecommerceDepartmentView.js";
import { changeDetector } from "../utility/changeDetector.util.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import Sequelize from "sequelize";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
import { MasterPackingSizeModel } from "../model/masterPackingSize.model.js";
const ecommerceDepartmentControllers = {
    async addNewEntry(data = {}, socket, io, currentRoute) {
        try {
            const {
                entryType,
                productId,
                quantity,
                masterPckSizeUnit,
                pricePerUnit,
                ecommerceUserId,
            } = await ecommerceEntrySchema.validate(data, {
                abortEarly: true,
                stripUnknown: true,
            });
            let masterPackingSizeData = await MasterPackingSizeModel.findOne({
                where: {
                    id: masterPckSizeUnit
                }
            });
            if (!masterPackingSizeData) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Packing Size not matched!!", currentRoute) })
            }
            const { unit_id: unitId, weight: weightPerUnit } = jsonFormator(masterPackingSizeData)
            let nextId = await EcommerceDepartmentModel.max("id");
            nextId = nextId == null ? 1 : nextId + 1;
            const transaction = await sequelize.transaction();
            try {
                // insert data in ecommerce-department table
                let insertResult = await EcommerceDepartmentModel.create(
                    {
                        entry_type_id: entryType,
                        product_id: productId,
                        master_packing_size_id: masterPckSizeUnit,
                        unit_id: unitId,
                        quantity: quantity,
                        weight_per_unit: weightPerUnit,
                        priceper_unit: pricePerUnit,
                        ecommerce_user_id: ecommerceUserId,
                        db_table_id: nextId,
                        db_table_name: "Stock_Department",
                        created_by: socket.user.id,
                    },
                    { transaction }
                );
                if (!insertResult) {
                    throw new Error("error while inserting ");
                }
                insertResult = jsonFormator(insertResult);
                // inserted id of Ecommerce_departement table
                const insertId = insertResult.id;
                delete insertResult.id;
                // if entry inserted successfully in ecommerce-department then also insert in (ecommerce-department_update) table
                const secondInsertResult = await EcommerceDepartmentUpdateModel.create(
                    {
                        ...insertResult,
                        ref_table_id: insertId,
                        activity: "New",
                    },
                    { transaction }
                );
                if (!secondInsertResult) {
                    throw new Error(
                        "Error in creating second entry in ecommerce-department_update table =>"
                    );
                }
                // Updated details object with default values for required fields
                const details = {
                    product_id: productId,
                    quantity: quantity,
                    unit_id: unitId,
                    pricePerUnit: 0,
                    db_table_name: "Ecommerce_Department",
                    db_table_id: insertId,
                    entry_type_id: insertResult?.entry_type_id,
                    created_by: socket.user.id,
                    // Adding default values for required fields
                    in_departmenthead_id: 1, // Default value, adjust as needed
                    in_department_id: 2, // Default value, adjust as needed
                    send_db_table_name: "Stock_Department",
                    send_departmenthead_id: 1, // Default value, adjust as needed
                    send_department_id: 2, // Default value, adjust as needed
                };
                const insertInAdminApproval =
                    await commonControllers.insertApprovalForManagerAdmin(
                        details,
                        transaction,
                        socket,
                        io,
                        currentRoute
                    );
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
                this.getAllEntries(data, socket, io, "ecommerce-dpt:all");
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
    async getAllEntries(data, socket, io, currentRoute) {
        try {
            let allEntries = await EcommerceDepartmentView.findAll({
                where: {
                    edStatus: true,
                },
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
    async fetchDatabyEdprtId(data, socket, io, currentRoute) {
        try {
            console.log("Ecommerce department id =>", data);
            // get user id from data
            const { id } = data;
            let EdprtResult = await EcommerceDepartmentView.findOne({
                where: { eDId: id },
                // attributes: {
                //   exclude: [
                //     "approvalstatus_id",
                //     "approval_by",
                //     "payment_status_to_vendor",
                //     "status",
                //     "created_by",
                //     "created_on",
                //     "updated_by",
                //     "updated_on",
                //   ],
                // },
            });
            EdprtResult = jsonFormator(EdprtResult);
            //   if user not exists
            if (!EdprtResult) {
                return socket.emit(
                    currentRoute,
                    ...apiResponse.error(
                        false,
                        "Quality Control not found !",
                        currentRoute
                    )
                );
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Ecommerce department fetched ",
                    currentRoute,
                    EdprtResult
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
        console.log("Received data:", data);
        try {
            const updateSchema = ecommerceEntrySchema.concat(idSchema);
            const {
                entryType,
                productId,
                quantity,
                masterPckSizeUnit,
                pricePerUnit,
                ecommerceUserId,
                departmentId = "27",
                id
            } = await updateSchema.validate(data);
            console.log("Validated data:", {
                entryType,
                productId,
                masterPckSizeUnit,
                quantity,
                pricePerUnit,
                ecommerceUserId,
                departmentId,
                id
            });
            let masterPackingSizeData = await MasterPackingSizeModel.findOne({
                where: {
                    id: masterPckSizeUnit
                }
            });
            if (!masterPackingSizeData) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Packing Size not matched!!", currentRoute) })
            }
            const { unit_id: unitId, weight: weightPerUnit } = jsonFormator(masterPackingSizeData)
            let departmentDetails = await MasterDepartmentModel.findByPk(
                departmentId
            );
            console.log("Department details:", departmentDetails);
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
            const { table_name } = jsonFormator(departmentDetails);
            console.log("Department table name:", table_name);
            let nextId = await EcommerceDepartmentModel.max("id");
            nextId = nextId == null ? 1 : nextId + 1;
            let isExists = await EcommerceDepartmentModel.findByPk(id, {
                attributes: [
                    "entry_type_id",
                    "product_id",
                    "unit_id",
                    "quantity",
                    "weight_per_unit",
                    "priceper_unit",
                    "ecommerce_user_id",
                    "db_table_name",
                ],
            });
            console.log("Existing entry data:", isExists);
            if (!isExists) {
                return socket.emit(currentRoute, {
                    success: false,
                    message: customMessage.notFound,
                    currentRoute,
                });
            }
            isExists = jsonFormator(isExists);
            const change = {
                entry_type_id: entryType,
                product_id: productId,
                unit_id: unitId,
                quantity: Number(quantity),
                weight_per_unit: parseFloat(weightPerUnit),
                priceper_unit: parseFloat(pricePerUnit),
                ecommerce_user_id: ecommerceUserId,
                updated_by: socket.user.id,
                updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                db_table_name: table_name,
                db_table_id: nextId,
            };
            console.log("Change object:", change);
            isExists.quantity = parseFloat(isExists.quantity);
            const hasChanges = changeDetector(isExists, change);
            console.log("Has changes:", hasChanges);
            if (!hasChanges) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.noChange, currentRoute),
                });
            }
            const transaction = await sequelize.transaction();
            console.log("Transaction started");
            try {
                const [updateResult] = await EcommerceDepartmentModel.update(
                    {
                        entry_type_id: entryType,
                        product_id: productId,
                        unit_id: unitId,
                        master_packing_size_id: masterPckSizeUnit,
                        quantity: parseFloat(quantity).toFixed(2),
                        weight_per_unit: parseFloat(weightPerUnit),
                        priceper_unit: parseFloat(pricePerUnit),
                        ecommerce_user_id: ecommerceUserId,
                        updated_by: socket.user.id,
                        db_table_name: table_name,
                        db_table_id: id,
                    },
                    {
                        where: { id },
                        transaction,
                    }
                );
                console.log("Update result:", updateResult);
                if (!updateResult) {
                    throw new Error("Error while updating");
                }
                const secondInsertResult = await EcommerceDepartmentUpdateModel.create(
                    {
                        entry_type_id: entryType,
                        ref_table_id: id,
                        product_id: productId,
                        unit_id: unitId,
                        quantity,
                        master_packing_size_id: masterPckSizeUnit,
                        weight_per_unit: weightPerUnit,
                        priceper_unit: pricePerUnit,
                        ecommerce_user_id: ecommerceUserId,
                        updated_by: socket.user.id,
                        db_table_name: "Ecommerce_Department",
                        send_db_table_name: table_name,
                        db_table_id: id,
                        in_department_id: socket.user.department_id,
                        send_department_id: departmentId,
                        date: Date.now(),
                        created_by: socket.user.id,
                        activity: "update",
                    },
                    { transaction }
                );
                console.log("Second insert result:", secondInsertResult);
                if (!secondInsertResult) {
                    throw new Error(
                        "Error in creating second entry in ecommerce_department_update table"
                    );
                }
                const details = {
                    product_id: productId,
                    quantity,
                    unit_id: unitId,
                    pricePerUnit: pricePerUnit,
                    entry_type_id: entryType,
                    created_by: socket.user.id,
                    send_db_table_name: "Ecommerce_Department",
                    db_table_name: "Ecommerce_Department",
                    db_table_id: id,
                    send_department_id: "27",
                };
                console.log("Details for updateApprovalForManagerAdmin:", details);
                const updated = await commonControllers.updateApprovalForManagerAdmin(
                    details,
                    transaction,
                    "Ecommerce_Department",
                    id,
                    socket,
                    io,
                    currentRoute
                );
                console.log("Admin update result:", updated);
                if (!updated) {
                    throw new Error("Error in updateApprovalForManagerAdmin");
                }
                await transaction.commit();
                console.log("Transaction committed");
                socket.emit(currentRoute, {
                    ...apiResponse.success(true, customMessage.updSucc, currentRoute),
                });
                return this.getAllEntries(data, socket, io, "ecommerce-dpt:all");
            } catch (error) {
                console.error("Error inside transaction:", error);
                await transaction.rollback();
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
        } catch (error) {
            console.error("Outer catch error:", error);
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
            let record = await EcommerceDepartmentModel.findOne({
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
                await previousRecord.update({ status: 0 }, { transaction });
                let data = await previousRecord.save({ transaction });
                data = jsonFormator(data);
                if (data.status) {
                    throw new Error("Failed to change status to 0");
                }
                const refrenceId = data.id;
                delete data.id;
                const insertResult = await EcommerceDepartmentUpdateModel.create(
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
                await transaction.commit();
                socket.emit(currentRoute, {
                    ...apiResponse.success(true, customMessage.delSucc, currentRoute),
                });
                return this.getAllEntries(data, socket, io, "ecommerce-dpt:all");
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
};
export default ecommerceDepartmentControllers;

