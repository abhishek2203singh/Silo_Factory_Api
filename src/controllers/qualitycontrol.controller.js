import { QualityControlModel } from "../model/qualityControl.model.js";
import { qualityContUserDptUntView } from "../model/views/qualitycontrolView.model.js";
import { apiResponse } from "../utility/response.util.js";
import { jsonFormator } from "../utility/toJson.util.js";
import Yup from "yup";
import moment from "moment";
import commonControllers from "./common.controller.js";
import { UserModel } from "../model/user.model.js";
import { QualityControlUpdate } from "../model/quality/qualityControlUpdate.model.js";
import { VkInfoApprovalVkQualityApprovalMng } from "../model/views/infoApprovalView.model.js";
import { Op } from "sequelize";
import {
    alertControllers,
    departmentControllers,
} from "../controllers/index.controller.js";
import { sequelize } from "../config/dbConfig.js";
import { customMessage } from "../utility/messages.util.js";
import { changeDetector } from "../utility/changeDetector.util.js";
import { BroadcastMethod } from "../Common/Broadcast.js";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
import { ProductModel } from "../model/product.model.js";


const qualitycontrolcontroller = {
    async reportvendorbyid(data, socket, io, currentRoute) {
        try {
            const Reports = await QualityControlModel.findAll({
                where: { vendor_id: data.vendorId },
            });
            socket.emit("Report:vendorByid", {
                ...apiResponse.success(
                    true,
                    "vendor goods reports",
                    currentRoute,
                    Reports
                ),
            });
        } catch (error) {
            console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async fetchqualitycontrolbyvendorId(data, socket, io, currentRoute, id) {
        try {
            let qualityControlResult = await qualityContUserDptUntView.findAll({
                order: [["created_on", "DESC"]],
                where: {
                    vendor_id: id,
                },
            });
            qualityControlResult = jsonFormator(qualityControlResult);
            socket.emit("quality:fetchtablebyvendorId", {
                ...apiResponse.success(
                    true,
                    "quality control",
                    currentRoute,
                    qualityControlResult
                ),
            });
        } catch (error) {
            console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    // to insert quality control data / new entry
    async InsertQcData(data, socket, io, currentRoute) {
        console.log("Set Data Value : ", data);
        try {
            var dat = new Date();
            var CerDat = moment(dat).format("YYYY-MM-DD");
            const qualityControlSchema = Yup.object({
                vendorId: Yup.number("Invalid Vendor").required("Vendor is required"),
                productId: Yup.number("Invalid Product").required(
                    "Product is required"
                ),
                quantity: Yup.number("Invalid Quantity").required(
                    "Quantity is required"
                ),
                unitId: Yup.number("Invalid Unit").required("Unit is required"),
                pricePerUnit: Yup.number("Invalid Unit Price").required(
                    "Unit Price is required"
                ),
                departmentId: Yup.string("Invalid Department").required(
                    "Department is required"
                ),
                departmentHeadId: Yup.string("Invalid Dept. Head").required(
                    "Department Head is required"
                ),
                packingSizeId: Yup.number()
                    .typeError("please select valid packing size")
                    .required("Packing size is required"),
                productTypeId: Yup.number()
                    .typeError("please select valid product type ")
                    .required("product type is required"),
                billImage: Yup.string().required("Bill Image is required"),
                created_by: Yup.number().default(socket.user.id),
                date: Yup.string().default(CerDat),
            });
            const validationResult = await qualityControlSchema.validate(data, {
                abortEarly: true,
                stripUnknown: true,
            });
            const {
                vendorId,
                productId,
                quantity,
                unitId,
                pricePerUnit,
                departmentId,
                departmentHeadId,
                packingSizeId,
                productTypeId,
                billImage,
                created_by,
            } = validationResult;


            let departmentDetails = await MasterDepartmentModel.findByPk(
                departmentId
            );

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

            const { uom } = productDetails;

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
            // if record already exists
            let isExistingUser = await QualityControlModel.findOne({
                where: {
                    vendor_id: vendorId,
                    product_id: productId,
                    quantity: quantity,
                    unit_id: packingSizeId ? 5 : unitId,//if packing size is selected then unit will be pcs else according to selected unit
                    priceper_unit: pricePerUnit,
                    ms_product_type_id: productTypeId,
                    db_table_name: table_name,
                    master_packing_size_id: packingSizeId,
                    department_id: departmentId, // id of destination department to which or from you are sending / requesting in other word destination department
                    departmenthead_id: departmentHeadId, // id of destination department head to or from you are sending / requesting
                    bill_image: billImage,
                    date: CerDat,
                    created_by: created_by,
                },
            });
            // const destinationDepartmentDetails = await MasterDepartmentModel.findByPk(
            //     departmentId
            // );
            // const { table_name: destinationTable } = jsonFormator(
            //     destinationDepartmentDetails
            // );
            isExistingUser = jsonFormator(isExistingUser);
            //   if user exists
            if (isExistingUser) {
                return socket.emit("error", {
                    ...apiResponse.error(
                        false,
                        "This Entry already exits",
                        currentRoute,
                        ""
                    ),
                });
            }
            // transaction start => *****************************
            const transaction = await sequelize.transaction();
            try {
                let qualityResult = await QualityControlModel.create(
                    {
                        vendor_id: vendorId,
                        product_id: productId,
                        quantity: quantity,
                        unit_id: uom,
                        priceper_unit: pricePerUnit,
                        db_table_name: table_name,
                        ms_product_type_id: productTypeId,
                        master_packing_size_id: packingSizeId,
                        department_id: departmentId, // id of destination department to which or from you are sending / requesting
                        departmenthead_id: departmentHeadId, // id of destination department head to which or from you are sending / requesting
                        bill_image: billImage,
                        date: CerDat,
                        created_by: created_by,
                    },
                    { transaction }
                );
                qualityResult = jsonFormator(qualityResult);
                if (!qualityResult.id) {
                    throw new Error("Failed to insert into QualityControl");
                }

                // insert data into quality control update table
                const insertedId = qualityResult.id;
                delete qualityResult.id;

                let qcUpdateResult = await QualityControlUpdate.create(
                    {
                        ...qualityResult,
                        ref_table_id: insertedId,
                        payment_status_by: qualityResult?.payment_status_to_vendor,
                        activity: "new",
                    },
                    { transaction }
                );
                qcUpdateResult = jsonFormator(qcUpdateResult);
                // any error while in sertin data
                if (!qcUpdateResult) {
                    throw new Error("Failed to insert into QualityControlUpdate");
                }

                // Plant Manager Approoval Insert Data

                var newdata = {
                    vendorId: vendorId,
                    product_id: productId,
                    quantity: quantity,
                    unit_id: uom,
                    priceper_unit: pricePerUnit,
                    send_db_table_name: table_name,//destination table name
                    send_department_id: departmentId,
                    send_departmenthead_id: departmentHeadId,
                    bill_image: billImage,
                    packingSizeId,
                    productTypeId,
                    date: sequelize.literal("CURRENT_TIMESTAMP"),
                    created_by: created_by,
                    db_table_name: "Quality_Control",
                    db_table_id: insertedId,
                    in_departmenthead_id: socket.user.id,
                    in_department_id: socket.user.department_id,
                    entry_type_id: 4,
                };
                await commonControllers.insertApprovalForManagerAdmin(
                    newdata,
                    transaction,
                    socket,
                    io,
                    currentRoute,
                    transaction
                );
                // insertapprovalformanageradmin
                let getUser = await UserModel.findAll(
                    {
                        where: {
                            department_id: [1, 8, 9],
                            status: 1,
                        },
                    },
                    { transaction }
                );
                let AlertMassg = {};
                getUser = jsonFormator(getUser);
                getUser.forEach(async (user) => {
                    if (user.role_id == 5 && user.id == data.vendorId) {
                        AlertMassg = {
                            department_id: user.department_id,
                            userid: user.id,
                            alerttype: 1,
                            messagetitle: "Information",
                            message:
                                "Your Product Quantity " + quantity + " is in Process.",
                            socketId: user.socket_id,
                        };
                        // TODO: transaction is not handled properly for alert messages
                        await alertControllers.insertAlert(
                            AlertMassg,
                            socket,
                            io,
                            currentRoute
                        );
                    }
                    if (user.role_id == 1) {
                        AlertMassg = {
                            department_id: user.department_id,
                            userid: user.id,
                            alerttype: 2,
                            messagetitle: "Approval",
                            message: "Product Quantity " + quantity + " is on waiting for Approval.",
                            socketId: user.socket_id,
                        };
                        await alertControllers.insertAlert(
                            AlertMassg,
                            socket,
                            io,
                            currentRoute
                        );
                    }
                    if (user.role_id == 2) {
                        AlertMassg = {
                            department_id: user.department_id,
                            userid: user.id,
                            alerttype: 2,
                            messagetitle: "Approval",
                            message: "Product Quantity " + quantity + " is on waiting for Approval.",
                            socketId: user.socket_id,
                        };
                        await alertControllers.insertAlert(
                            AlertMassg,
                            socket,
                            io,
                            currentRoute
                        );
                    }

                    // console.log("user name", user.full_name)
                });

                await transaction.commit();
                socket.emit(currentRoute, {
                    ...apiResponse.success("true", "Entry successfully"),
                });
                // broad cast to admin
                BroadcastMethod.broadcastToAllRequiredClients({}, socket,
                    io, currentRoute
                )
                this.fetchqualitycontrolbyLoggedInUser(data, socket, io, "listen:Quality_Control");
                // await BroadcastMethod.allapprovalBroadcastwithoutconditon(
                //   data,
                //   socket,
                //   io,
                //   "allapproval"
                // );
                await BroadcastMethod.broadcastToAllRequiredClients(
                    {
                        source: "Quality_Control",
                    },
                    socket,
                    io,
                    currentRoute
                );
                if (vendorId > 0) {
                    await BroadcastMethod.fetchqualitycontrolbyvendorIdbroadcast(
                        data,
                        socket,
                        io,
                        "quality:fetchtablebyvendorId",
                        vendorId
                    );
                }
            } catch (error) {
                console.log(error);
                transaction.rollback();
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        customMessage.wentWrong,
                        currentRoute,
                        error
                    ),
                });
            }
            // transaction End => *****************************
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                console.log("inside catch yup");
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
            console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async fetchqualitycontrolbyLoggedInUser(data, socket, io, currentRoute) {
        try {
            let qualityControlResult = await qualityContUserDptUntView.findAll({
                where: {
                    status: true,
                },
                order: [["created_on", "DESC"]],
            });
            qualityControlResult = jsonFormator(qualityControlResult);
            // to prevent data loss, because broadcast doesn't emit on the source
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "added successfully ",
                    currentRoute,
                    qualityControlResult
                ),
            });
            // console.log("hello", socket.route, qualityControlResult)
            socket.broadcast.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "added successfully ",
                    currentRoute,
                    qualityControlResult
                ),
            });
        } catch (error) {
            console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getVendorforQualityById(data, socket, io, currentRoute) {
        try {
            // get user id from data
            const { id } = data;
            console.log("Quality id =>", id);
            let qualityControlResultById = await qualityContUserDptUntView.findOne({
                where: { id: id },
                attributes: {
                    exclude: [
                        "approval_status_id",
                        "approval_by",
                        "payment_status_to_vendor",
                        "status",
                        "created_by",
                        "created_on",
                        "updated_by",
                        "updated_on",
                    ],
                },
            });
            qualityControlResultById = jsonFormator(qualityControlResultById);
            //   if user not exists
            if (!qualityControlResultById) {
                return socket.emit(
                    currentRoute,
                    ...apiResponse.error(
                        false,
                        "Quality Control not found !",
                        currentRoute
                    )
                );
            }
            const { department_id } = qualityControlResultById;
            departmentControllers.getAllDepartmentHead(
                { department_id, role_id: [11, 3] },
                socket,
                io,
                "department:head"
            );
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Quality",
                    currentRoute,
                    qualityControlResultById
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getVendorDataById(data, socket, io, currentRoute) {
        try {
            // Get user id from data
            const { Vru_id } = data;

            console.log("Quality id ggghg=>", Vru_id);

            let vendorDataResultById = await qualityContUserDptUntView.findAll({
                where: { id: Vru_id },

                attributes: {
                    exclude: [
                        "approval_status_id",
                        "approval_by",
                        "payment_status_to_vendor",
                        "status",
                        "created_by",
                        "created_on",
                        "updated_by",
                        "updated_on",
                    ],
                },
                // Order by date or created_on in descending order
                order: [["date", "DESC"]], // Replace 'date' with the relevant field if needed
            });

            vendorDataResultById = jsonFormator(vendorDataResultById);

            // If user does not exist
            if (!vendorDataResultById || vendorDataResultById.length === 0) {
                return socket.emit(
                    currentRoute,
                    ...apiResponse.error(
                        false,
                        "Quality Control not found!",
                        currentRoute
                    )
                );
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Quality",
                    currentRoute,
                    vendorDataResultById
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    // delete an entry of vendor
    async deleteVendorForQualityById({ id = false }, socket, io, currentRoute) {
        try {
            // console.log("Received data for deletion:", data);
            if (!id) {
                console.error("ID not provided in data:", id);
                socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute, []),
                });
                return;
            }
            // Find the record by ID
            const record = await QualityControlModel.findOne({
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
            const { approval_status_id } = jsonFormator(record);
            // if entry is approved
            if (approval_status_id == 3) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        customMessage.dinpeiaa,
                        currentRoute
                    )
                });
            }
            const transaction = await sequelize.transaction();
            try {
                // Perform the soft delete by updating the status to 0
                await record.update({ status: 0, updated_by: socket.user.id, updated_on: sequelize.literal('CURRENT_TIMESTAMP') }, { transaction });
                let data = await record.save({ transaction });
                data = jsonFormator(data);
                console.log("delete =>", data);

                if (data.status) {
                    throw new Error("Failed to change status to 0");
                }

                const refrenceId = data.id;
                delete data.id;
                const { db_table_name } = record;
                const insertResult = await QualityControlUpdate.create(
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
                return this.fetchqualitycontrolbyLoggedInUser(data, socket, io, "listen:Quality_Control");
            } catch (error) {
                console.error("Error during deletion:", error);
                await transaction.rollback();
                socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
        } catch (error) {
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
    // update an entry 
    async updateQualityDtls(data, socket, io, currentRoute) {
        try {
            console.table(data);
            const qualityDetailsSchema = Yup.object({
                id: Yup.number().required("Unable to perform this action, try again!"),
                vendorId: Yup.number().required("Vendor is required"),
                productId: Yup.number().required("Product is required"),
                quantity: Yup.number().required("Quantity is required"),
                // unitId: Yup.number().required("Unit is required"),
                pricePerUnit: Yup.number().required("Unit Price is required"),
                departmentId: Yup.string().required("Department is required"),
                departmentHeadId: Yup.string().required("Department Head is required"),
                billImage: Yup.string().required("Bill Image is required"),
                packingSizeId: Yup.number()
                    .typeError("please select valid packing size")
                    .required("Packing size is required"),
                productTypeId: Yup.number()
                    .typeError("please select valid product type ")
                    .required("product type is required"),
            });
            // Validate the data
            const validationResult = await qualityDetailsSchema.validate(data, {
                abortEarly: true,
                stripUnknown: true,
            });
            const {
                id: recordId,
                vendorId,
                productId,
                quantity,
                pricePerUnit,
                departmentId,
                departmentHeadId,
                billImage,
                packingSizeId,
                productTypeId,
            } = validationResult;


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


            const { uom } = productDetails;

            //   delete id; // Remove id from details to be updated

            console.log("validationResult", validationResult);

            //   add change detector
            let currentData = await QualityControlModel.findByPk(recordId, {
                attributes: [
                    "id",
                    "vendor_id",
                    "product_id",
                    "quantity",
                    "unit_id",
                    "priceper_unit",
                    "department_id",
                    "departmenthead_id",
                    "bill_image",
                    "payment_status_to_vendor",
                ],
            });
            if (!currentData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Record " + customMessage.notEx),
                });
            }
            // if entry is approved
            if (currentData.approval_status_id == 3) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        customMessage.mnpeiaa,
                        currentRoute
                    )
                });
            }

            currentData = jsonFormator(currentData);
            //   const { payment_status_to_vendor } = currentData;

            delete currentData.payment_status_to_vendor;
            console.log(currentData);

            const newChanges = {
                id: recordId,
                vendor_id: vendorId,
                product_id: productId,
                quantity: parseFloat(quantity).toFixed(2),
                unit_id: packingSizeId ? 5 : uom,//if packing size is selected then unit will be pcs else according to selected unit
                priceper_unit: parseFloat(pricePerUnit).toFixed(2),
                department_id: parseInt(departmentId),
                departmenthead_id: parseInt(departmentHeadId),
                bill_image: billImage,
            };
            const hasChange = changeDetector(currentData, newChanges);
            if (!hasChange) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.noChange, currentRoute),
                });
            }

            // transaction start ****************************************
            const transaction = await sequelize.transaction();

            try {
                // STEP 1
                // Update the quality control details
                let [updateResult] = await QualityControlModel.update(
                    {
                        vendor_id: vendorId,
                        product_id: productId,
                        quantity: parseFloat(quantity).toFixed(2),
                        unit_id: uom,
                        priceper_unit: parseFloat(pricePerUnit).toFixed(2),
                        department_id: parseInt(departmentId),
                        departmenthead_id: parseInt(departmentHeadId),
                        bill_image: billImage,
                    },
                    {
                        where: { id: recordId },
                        transaction,
                    }
                );

                if (updateResult == 0) {
                    throw new Error("Failed to Update into QualityControl");
                }

                console.log("upadated successfully =>", updateResult);
                // validationResult:{} ...validationResult {}
                // read id from  id

                // find  data on the behalf of the  (where db_table_name="'Quantity_Control'" and )

                // socket.emit(currentRoute, {
                //     ...apiResponse.success(true, "Record updated successfully", currentRoute, validationResult),
                // });

                // STEP 2
                // get current data from quality control
                let currentQualityData = await QualityControlModel.findOne({
                    where: { id: recordId },
                    transaction,
                });

                if (!currentQualityData) {
                    throw new Error("Failed to fetch from  QualityControl");
                }

                currentQualityData = jsonFormator(currentQualityData);
                delete currentQualityData.id;
                // STEP 3
                // insert record  into quality control update
                let qcUpdateResult = await QualityControlUpdate.create(
                    {
                        ...currentQualityData,
                        ref_table_id: recordId,
                        payment_status_by: currentQualityData.payment_status_to_vendor,
                        activity: "update",
                    },
                    { transaction }
                );
                if (!qcUpdateResult) {
                    throw new Error("Failed to insert into QualityControl Update");
                }
                qcUpdateResult = jsonFormator(qcUpdateResult);
                console.log("inserted  successfully =>", qcUpdateResult);
                // any error while in sertin data

                //update in ApprovalForManagerAdmin

                const details = {
                    vendorId: vendorId,
                    product_id: productId,
                    quantity: quantity,
                    unit_id: uom,
                    priceper_unit: pricePerUnit,
                    send_db_table_name: "Silo_Department",
                    send_department_id: departmentId,
                    send_departmenthead_id: departmentHeadId,
                    bill_image: billImage,
                    db_table_name: "Quality_Control",
                    db_table_id: recordId,
                    in_departmenthead_id: socket.user.id,
                    in_department_id: socket.user.department_id,
                    entry_type_id: 1,
                    packingSizeId,
                    productTypeId,
                };
                await commonControllers.updateApprovalForManagerAdmin(
                    details,
                    transaction,
                    "Quality_Control",
                    recordId,
                    socket,
                    io,
                    currentRoute
                );
                await transaction.commit();
                socket.emit(currentRoute, {
                    ...apiResponse.success(true, customMessage.updSucc, currentRoute),
                });
                this.fetchqualitycontrolbyLoggedInUser(data, socket, io, "listen:Quality_Control");
                await BroadcastMethod.allapprovalBroadcastwithoutconditon(
                    data,
                    socket,
                    io,
                    "allapproval"
                );
                if (vendorId > 0) {
                    await BroadcastMethod.fetchqualitycontrolbyvendorIdbroadcast(
                        data,
                        socket,
                        io,
                        "quality:fetchtablebyvendorId",
                        vendorId
                    );
                }
            } catch (error) {
                console.error("ERRRRRRRR => ", error);
                await transaction.rollback();
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        customMessage.wentWrong,
                        currentRoute,
                        error
                    ),
                });
            }
        } catch (error) {
            console.error("ERROR while updating =>", error);
            if (error instanceof Yup.ValidationError) {
                const errorMessage = error.errors.join(", ");
                console.error("Validation error =>", errorMessage);
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, errorMessage, currentRoute, error),
                });
            }
            return socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async qcapprovalbyId(data, socket, io, currentRoute) {
        try {
            // console.log(data)
            // const DB_TABLE_NAME = "Quantity_Control";
            // Get id from the request data
            const { id } = data;

            console.log("Approval id =>", id);

            // Find the approval entry based on qtyapmg_db_table_name and id
            let qualityControlapprovalById =
                await VkInfoApprovalVkQualityApprovalMng.findOne({
                    where: {
                        qtyapmg_db_table_id: id,
                    },
                });

            // Format the result (optional, based on your jsonFormator function)
            qualityControlapprovalById = jsonFormator(qualityControlapprovalById);

            // Check if data exists
            if (!qualityControlapprovalById) {
                return socket.emit(
                    currentRoute,
                    apiResponse.error(
                        false,
                        "Quality Control approval not found!",
                        currentRoute
                    )
                );
            }
            // Emit the result back to the client
            socket.emit(
                currentRoute,
                apiResponse.success(
                    true,
                    "Quality Control approval fetched successfully",
                    currentRoute,
                    qualityControlapprovalById
                )
            );
        } catch (error) {
            // Handle errors
            console.error("Error in qcapprovalbyId:", error);
            socket.emit(
                currentRoute,
                apiResponse.error(false, error.message, currentRoute, error)
            );
        }
    },

    async getVendorDataByDate(data, socket, io, currentRoute) {
        try {
            const { fromDate, tillDate } = data;

            console.log("Date Range =>", fromDate, tillDate);

            // Convert date strings to Date objects
            const startDate = new Date(fromDate);
            const endDate = new Date(tillDate);

            // Validate date conversion
            if (isNaN(startDate) || isNaN(endDate)) {
                return socket.emit(
                    currentRoute,
                    apiResponse.error(false, "Invalid date format.", currentRoute)
                );
            }
            // If the dates are the same, adjust the endDate to include the whole day
            if (startDate.toDateString() === endDate.toDateString()) {
                endDate.setHours(23, 59, 59, 999); // Set to the end of the day
            }
            // Fetch vendor data based on the date range
            const vendorDataResultByDate = await qualityContUserDptUntView.findAll({
                where: {
                    date: {
                        [Op.between]: [startDate, endDate], // Using Op.between for date range filtering
                    },
                },
                // Uncomment if you need to exclude attributes
                // attributes: {
                //   exclude: [
                //     "approvalstatus_id", "approval_by", "payment_status_to_vendor",
                //     "status", "created_by", "created_on", "updated_by", "updated_on",
                //   ],
                // },
            });
            // If no data is found, send a response back to the client
            if (!vendorDataResultByDate || vendorDataResultByDate.length === 0) {
                return socket.emit(
                    currentRoute,
                    apiResponse.error(
                        false,
                        "No data found for the given vendor and date range.",
                        currentRoute
                    )
                );
            }
            // Emit the success response with the retrieved data
            socket.emit(
                currentRoute,
                apiResponse.success(
                    true,
                    "Data retrieved successfully.",
                    currentRoute,
                    vendorDataResultByDate
                )
            );
        } catch (error) {
            // Log the error for debugging purposes
            console.error("Error fetching vendor data by date:", error);
            // Emit the error to the client
            socket.emit(
                "error",
                apiResponse.error(false, error.message, currentRoute, error)
            );
        }
    },
};

export default qualitycontrolcontroller;
