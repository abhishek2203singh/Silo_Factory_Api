import moment from "moment";
import { Op } from "sequelize";
import { apiResponse } from "../utility/response.util.js";
import Yup from "yup";
import { sequelize } from "../config/dbConfig.js";
import { SiloDepartmentView } from "../model/views/silosDepartmentView.js";
import { ClonesiloDepartmentUpdateModal } from "../model/cloneSilosdepartment.modal.js";
import { customMessage } from "../utility/messages.util.js";
import { SiloDepartmentModal } from "../model/silodDepartment.modal.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { MasterSilosModel } from "../model/masterSilos.model.js";
import { departmentEntrySchema } from "../yup-schemas/departmentEntry.schema.js";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
import commonControllers from "./common.controller.js";
import { SiloDepartmentUpdateModel } from "../model/siloDepartmentUpdate.model.js";
import { ProductModel } from "../model/product.model.js";
const silosDepartmentControllers = {
    async addNewEntry(data = {}, socket, io, currentRoute) {
        try {
            departmentEntrySchema;
            const {
                entryType,
                productId,
                quantity,
                departmentId, unitId,
                departmentHead,
                packingSizeId,
                productTypeId,
            } = await departmentEntrySchema.validate(data, {
                abortEarly: true,
                stripUnknown: true,
            });
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

            // const { uom } = productDetails;
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
            let nextId = await SiloDepartmentModal.max("id");
            nextId = nextId == null ? 1 : nextId + 1;

            //   check wether entry already exists
            const startOfDay = moment().startOf("day");
            const endOfDay = moment().endOf("day");
            const isExists = await SiloDepartmentModal.findOne({
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
                let insertResult = await SiloDepartmentModal.create(
                    {
                        entry_type_id: entryType,
                        product_id: productId,
                        unit_id: unitId,
                        quantity: quantity,
                        department_id: departmentId,
                        departmenthead_id: departmentHead,
                        db_table_name: table_name,
                        db_table_id: nextId,
                        ms_product_type_id: productTypeId,
                        master_packing_size_id: packingSizeId,
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

                //   if entry inserted sucessfully in pasteurization-department then also insert in (silos-department_update) table
                const secondInsertResult = await SiloDepartmentUpdateModel.create(
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
                    db_table_name: "Silo_Department",
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
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    // get all product from database
    async fetchAllDatafromSilodprt(data, socket, io, currentRoute) {
        try {
            const silosdprtResult = await SiloDepartmentView.findAll({
                order: [["created_on", "DESC"]],
            });
            // console.log(silosdprtResult)
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "silos department",
                    currentRoute,
                    silosdprtResult
                ),
            });
        } catch (error) {
            console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async updateDatainSilodprt(data, socket, io, currentRoute) {
        try {
            const silosDepartSchema = Yup.object({
                departmentApproval: Yup.number(customMessage.badReq).required(
                    customMessage.badReq
                ),
                sDepartmentId: Yup.number(customMessage.badReq).required(
                    customMessage.badReq
                ),
            });

            const { sDepartmentId, departmentApproval } = await silosDepartSchema.validate(data);

            let departSilosSts = await SiloDepartmentModal.findOne({
                where: {
                    id: sDepartmentId,
                },
            });
            if (!departSilosSts) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Silos department not found !!",
                        currentRoute
                    ),
                });
            }
            let [departsilosResult] = await SiloDepartmentModal.update(
                {
                    approval_status_by_destination: departmentApproval,
                    updated_by: socket.user.id,
                },
                {
                    where: {
                        id: sDepartmentId,
                    },
                }
            );
            if (!departsilosResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Status Not change!!", currentRoute),
                });
            }
            let getData = await SiloDepartmentModal.findOne({
                where: {
                    id: sDepartmentId,
                },
            });
            getData = jsonFormator(getData);
            let updatetbleResult = await ClonesiloDepartmentUpdateModal.create({
                entry_type_id: getData.entry_type_id,
                activity: "Update",
                approval_status_by_destination: getData.approval_status_by_destination,
                date: getData.date ? new Date(getData.date).toISOString() : null, // Convert date to string
                product_id: getData.product_id,
                ms_product_type_id: getData?.ms_product_type_id,
                quantity: getData.quantity,
                distributed_quantity: getData.distributed_quantity,
                unit_id: getData.unit_id,
                db_table_name: getData.db_table_name,
                db_table_id: getData.db_table_id,
                ref_table_id: getData.id,
                with_approval: getData.with_approval,
                status: getData.status,
                created_by: getData.updated_by,
            });
            if (!updatetbleResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, customMessage.delSucc, currentRoute),
            });
            silosDepartmentControllers.fetchAllDatafromSilodprt(
                data,
                socket,
                io,
                "silos-dpt:all"
            );
        } catch (error) {
            console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async fetchDatabySilodprtId(data, socket, io, currentRoute) {
        try {
            // get user id from data
            const { silDId } = data;

            console.log("Silo department id =>", silDId);
            let silosdprtResult = await SiloDepartmentView.findOne({
                where: { silDId: silDId },

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
            silosdprtResult = jsonFormator(silosdprtResult);
            //   if user not exists
            if (!silosdprtResult) {
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
                    "Silos department fetched ",
                    currentRoute,
                    silosdprtResult
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getDashboardData(data, socket, io, currentRoute) {
        try {
            // get total milk recived today
            //total milk send today
            // pending requests in liters
            //pending demands in liters
            // current stock
            // total silos
            // total vestage
            const startOfDay = await moment().startOf("day").toDate();
            const endOfDay = await moment().endOf("day").toDate();
            console.log({ startOfDay, endOfDay });
            const [
                totalMilkIn,
                totolMilkOut,
                pendingDemand,
                pendingRequest,
                totalSilos,
                availableMilk,
            ] = await Promise.all([
                SiloDepartmentModal.sum("quantity", {
                    where: {
                        date: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                        entry_type_id: 3, //stock
                        approval_status_id: 3, //approved
                    },
                }),
                SiloDepartmentModal.sum("quantity", {
                    where: {
                        date: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                        entry_type_id: 2, //request
                        approval_status_id: 3, //approved
                    },
                }),
                SiloDepartmentModal.sum("quantity", {
                    where: {
                        date: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                        entry_type_id: 1, // demand
                        approval_status_id: 1, //pending
                    },
                }),
                SiloDepartmentModal.sum("quantity", {
                    where: {
                        date: {
                            [Op.between]: [startOfDay, endOfDay],
                        },
                        entry_type_id: 2, //request
                        approval_status_id: 1, //pending
                    },
                }),
                MasterSilosModel.count(),
                MasterSilosModel.sum("total_available_milk"),
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
export default silosDepartmentControllers;
