import Yup from "yup";
import moment from "moment";
import { Op } from "sequelize";
import { apiResponse } from "../utility/response.util.js";
import { PasteurizationDptModel } from "../model/pasteurizationDpt.model.js";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { customMessage } from "../utility/messages.util.js";
import commonControllers from "./common.controller.js";
import { PasteurizationDptUpdateModel } from "../model/pasteurizationDptUpdate.model.js";
import { changeDetector } from "../utility/changeDetector.util.js";
import { sequelize } from "../config/dbConfig.js";
import { departmentEntrySchema } from "../yup-schemas/departmentEntry.schema.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import { PasteurizationDepartmentModel } from "../model/views/pasteurizationDprtView.model.js";
import { MasterPasteurizationSilosModel } from "../model/masterPasteurizationSilo.model.js";
import { BroadcastMethod } from "../Common/Broadcast.js";
import { ProductModel } from "../model/product.model.js";
import { MasterEntryTypeModel } from "../model/masterEntryType.model.js";


// controllers to intract with pasteurization department table
const pasteurizationDptControllers = {
    // to add new entry in pasteurization department table

    async addNewEntry(data = {}, socket, io, currentRoute) {
        try {
            departmentEntrySchema;
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
                        "Product" + customMessage.notEx + "or disabled",
                        currentRoute,
                        ""
                    ),
                });
            }
            // const { unitId } = productDetails;
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
            // check if  department exists
            const { table_name } = jsonFormator(departmentDetails);
            // console.log("departmentDetails =>", table_name);
            let nextId = await PasteurizationDptModel.max("id");
            nextId = nextId == null ? 1 : nextId + 1;
            //   check wether entry already exists
            const startOfDay = moment().startOf("day");
            const endOfDay = moment().endOf("day");
            const isExists = await PasteurizationDptModel.findOne({
                where: {
                    entry_type_id: entryType,
                    product_id: productId,
                    unit_id: unitId,
                    quantity: quantity,
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
                // insert data in pasteurization-department table
                let insertResult = await PasteurizationDptModel.create(
                    {
                        entry_type_id: entryType,
                        product_id: productId,
                        unit_id: packingSizeId ? 5 : unitId,
                        quantity: quantity,
                        department_id: departmentId,
                        departmenthead_id: departmentHead,
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
                // inserted id of pasteurization_departement table
                const insertId = insertResult.id;
                delete insertResult.id;
                //   if entry inserted sucessfully in pasteurization-department then also insert in (pasteurization-department_update) table
                const secondInsertResult = await PasteurizationDptUpdateModel.create(
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
                        "Error in creating second entry in pasteurization-department_update table =>"
                    );
                }
                const details = {
                    product_id: productId,
                    quantity: quantity,
                    unit_id: unitId,
                    pricePerUnit: 0,
                    db_table_name: "Pasteurization_Department",
                    send_db_table_name: table_name,
                    db_table_id: insertId,
                    in_departmenthead_id: socket.user.id,
                    in_department_id: socket.user.department_id,
                    send_department_id: departmentId,
                    send_departmenthead_id: departmentHead,
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
                socket.emit(currentRoute, {
                    ...apiResponse.success(
                        true,
                        "Entry added successfully",
                        currentRoute
                    ),
                });
                await BroadcastMethod.broadcastToAllRequiredClients(
                    { source: "Pasteurization_Department", destination: table_name },
                    socket,
                    io,
                    currentRoute
                );
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
            console.log(error);
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
                unitId,
                quantity,
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
                        "Product" + customMessage.notEx + "or disabled",
                        currentRoute,
                        ""
                    ),
                });
            }
            // const { unitId } = productDetails;
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
            let isExists = await PasteurizationDptModel.findOne({
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
            // check wither if anything is changed
            const change = {
                entry_type_id: entryType,
                product_id: productId,
                unit_id: packingSizeId ? 5 : unitId,//if packing size is selected then unit will be pcs else according to selected unit
                quantity: Number(quantity),
                department_id: departmentId,
                departmenthead_id: departmentHead,
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
                const [upadateResult] = await PasteurizationDptModel.update(
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
                    console.log("update result =>", upadateResult);
                    throw new Error("error while updating ");
                }
                const secondInsertResult = await PasteurizationDptUpdateModel.create(
                    {
                        entry_type_id: entryType,
                        ref_table_id: id,
                        product_id: productId,
                        unit_id: unitId,
                        quantity: quantity,
                        department_id: departmentId,
                        departmenthead_id: departmentHead,
                        date: Date.now(),
                        db_table_name: table_name,
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
                    quantity: Number(quantity),
                    unit_id: unitId,
                    pricePerUnit: 0,
                    db_table_name: "Pasteurization_Department",
                    send_db_table_name: table_name,
                    db_table_id: id,
                    in_departmenthead_id: socket.user.id,
                    in_department_id: socket.user.department_id,
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
                console.log("admin update result =>", updated);
                //   TODO: add notifications for all
                if (!updated) {
                    throw new Error("Error in updateApprovalForManagerAdmin ");
                }
                await transaction.commit();
                socket.emit(currentRoute, {
                    ...apiResponse.success(true, customMessage.updSucc, currentRoute),
                });
                return this.getAllEntries(data, socket, io, "pasteurization-dpt:all");
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
            if (!id) {
                console.error("ID not provided in data:", id);
                socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute, []),
                });
                return;
            }
            console.log("id =>", id)
            // Find the record by ID
            let record = await PasteurizationDptModel.findOne({
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
            const { db_table_name } = record;
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
                if (data.status) {
                    throw new Error("Failed to change status to 0");
                }
                const refrenceId = data.id;
                delete data.id;
                const insertResult = await PasteurizationDptUpdateModel.create(
                    {
                        ...data,
                        master_packing_size_id: data.master_packing_size_id ?? 0,
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
                return this.getAllEntries(data, socket, io, "pasteurization-dpt:all");
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
            let allEntries = await PasteurizationDepartmentModel.findAll({
                where: {
                    pidStatus: true
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
            console.log(error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async fetchDatabyPdprtId(data, socket, io, currentRoute) {
        try {
            // console.log("Pasteurization department id =>", data);
            // get user id from data
            const { pid } = data;
            let PdprtResult = await PasteurizationDepartmentModel.findOne({
                where: { pid: pid },
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
            PdprtResult = jsonFormator(PdprtResult);
            //   if user not exists
            if (!PdprtResult) {
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
                    "Pasteurization department fetched ",
                    currentRoute,
                    PdprtResult
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
    async getAllDashboardData(data, socket, io, currentRoute) {
        try {
            // get total milk recived today
            //total milk send today
            // pending requests in liters
            //pending demands in liters
            // current stock
            // total silos
            // total vestage
            const startOfDay = moment().startOf("day");
            const endOfDay = moment().endOf("day");
            console.log({ startOfDay, endOfDay });
            const [
                totalMilkIn,
                totolMilkOut,
                pendingDemand,
                pendingRequest,
                totalSilos,
                availableMilk,
            ] = await Promise.all([
                PasteurizationDptModel.sum("quantity", {
                    where: {
                        date: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                        entry_type_id: 3, // stock
                        approval_status_id: 3, // approved
                    },
                }),
                PasteurizationDptModel.sum("quantity", {
                    where: {
                        date: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                        entry_type_id: 2, //request
                        approval_status_id: 3, //approved
                    },
                }),
                // for pending demands
                PasteurizationDptModel.sum("quantity", {
                    where: {
                        date: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                        entry_type_id: 1, //demand
                        approval_status_id: 1,
                    },
                }),
                // for pending requests
                PasteurizationDptModel.sum("quantity", {
                    where: {
                        date: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                        entry_type_id: 2, //request
                        approval_status_id: 1,
                    },
                }),
                MasterPasteurizationSilosModel.count(),
                MasterPasteurizationSilosModel.sum("total_available_milk"),
            ]);
            socket.emit(currentRoute, {
                ...apiResponse.success(true, customMessage.fetched, currentRoute, {
                    totalMilkIn: totalMilkIn ?? 0,
                    totolMilkOut: totolMilkOut ?? 0,
                    pendingDemand: pendingDemand ?? 0,
                    pendingRequest: pendingRequest ?? 0,
                    totalSilos: totalSilos ?? 0,
                    availableMilk: availableMilk ?? 0,
                }),
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
};
export default pasteurizationDptControllers;

