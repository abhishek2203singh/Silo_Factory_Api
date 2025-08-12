/* eslint-disable no-unused-vars */
import Yup from "yup";
import { apiResponse } from "../utility/response.util.js";
import { PasteurizationInfoModel } from "../model/pasteurizationInfo.model.js";
import { MasterPasteurizationSilosModel } from "../model/masterPasteurizationSilo.model.js";
import { siloUtils } from "../utility/silo.util.js";
import { literal } from "sequelize";
import { jsonFormator } from "../utility/toJson.util.js";
import { customMessage } from "../utility/messages.util.js";
import { sequelize } from "../config/dbConfig.js";
import { PasteurizationDptModel } from "../model/pasteurizationDpt.model.js";
import { insertInsiloSchema } from "../yup-schemas/insertInSilo.schema.js";
import { PasteurizationDptUpdateModel } from "../model/pasteurizationDptUpdate.model.js";
import { PasteurizationInfoView } from "../model/views/pasteurizationInfoModel.View.js";
import Sequelize from "sequelize";
import pasteurizationDptControllers from "./pasteurizationDepartment.controller.js";
import commonControllers from "./common.controller.js";
import { BroadcastMethod } from "../Common/Broadcast.js";
const pasteurizationSiloControllers = {
    // to insert or remove from silos
    async insertInSilo(data, socket, io, currentRoute) {
        console.log("dta =>", data);
        const transaction = await sequelize.transaction();
        try {
            const { sourceId = false } = data;
            if (!sourceId) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute),
                });
            }
            let stockData = await PasteurizationDptModel.findByPk(sourceId);
            //   check wether distibuted quantity is equal to quantity
            // the return message  that quantity is already distibuted in silos
            // calcualte total quantity is to be distibuted if total to be distibuted is greater than quantity -distibuted -
            // if data is not found in respose to provide activityId
            if (!stockData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute),
                });
            }
            stockData = jsonFormator(stockData);
            let {
                quantity: originalQuantity,
                distributed_quantity: distibutedQty,
                approval_status_id,
            } = stockData;
            originalQuantity = parseFloat(originalQuantity);
            //   if quntity is fully destibuted
            if (originalQuantity == distibutedQty) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        customMessage.alreadyDistibuted,
                        currentRoute
                    ),
                });
            }
            if (approval_status_id != 3) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        customMessage.reqNotApproved,
                        currentRoute
                    ),
                });
            }
            const totalQtyToBeDistibuted = siloUtils.calTotalQuantity(data.entries);
            console.log(totalQtyToBeDistibuted);
            console.log({
                totalQtyToBeDistibuted,
                stockData,
            });
            //   if totalQtyToBeDistibuted is greater than originalQuantity
            if (totalQtyToBeDistibuted > originalQuantity - distibutedQty) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `Distribution quantity must not be greater than remaining/original quantity : ${originalQuantity - distibutedQty
                        }`,
                        currentRoute
                    ),
                });
            }
            // const
            // Handle array data
            if (Array.isArray(data.entries)) {
                for (const entry of data.entries) {
                    const result = await this.processSiloEntry(
                        entry,
                        socket,
                        transaction,
                        currentRoute,
                        insertInsiloSchema,
                        sourceId
                    );
                    if (!result) {
                        await transaction.rollback();
                        return;
                    }
                }
            } else {
                // Handle single entry data
                const result = await this.processSiloEntry(
                    data.entries,
                    socket,
                    transaction,
                    currentRoute,
                    insertInsiloSchema,
                    sourceId
                );
                if (!result) {
                    await transaction.rollback();
                    return;
                }
            }
            // upate distibuted quantit in Pasteurization_Department table
            let [distributionUpdate] = await PasteurizationDptModel.update(
                {
                    distributed_quantity: sequelize.literal(
                        `distributed_quantity+${Number(totalQtyToBeDistibuted)}`
                    ),
                },
                {
                    where: {
                        id: sourceId,
                    },
                    transaction,
                }
            );
            if (!distributionUpdate) {
                throw new Error("error while updating distibuted quantity");
            }
            delete stockData.id;
            console.log(stockData);
            // to insert the same entry in silo department update table
            const finalEntry = await PasteurizationDptUpdateModel.create(
                {
                    ...stockData,
                    activity: "update",
                    distributed_quantity: totalQtyToBeDistibuted,
                    created_by: socket?.user?.id,
                    db_table_id: sourceId,
                    db_table_name: "Pasteurization_Department",
                    ref_table_id: sourceId,
                },
                { transaction }
            );
            if (!finalEntry) {
                throw new Error("error while inserting entry in update table");
            }
            // entry was request type then insert an entry of stock out
            if (stockData.entry_type_id == 2) {
                const upcomingId = await PasteurizationDptModel.max('id') + 1
                console.log("upcomming id=>", upcomingId);
                // create a stock out entry
                let newEntryResult = await PasteurizationDptModel.create({
                    entry_type_id: 4,//stock out
                    this_table_ref_id: sourceId,
                    product_id: stockData.product_id,
                    unit_id: stockData.unit_id,
                    quantity: totalQtyToBeDistibuted,
                    distributed_quantity: totalQtyToBeDistibuted,
                    department_id: stockData.department_id,
                    departmenthead_id: stockData.departmenthead_id,
                    db_table_name: stockData.db_table_name,
                    db_table_id: upcomingId,
                    ms_product_type_id: stockData.ms_product_type_id,
                    approval_status_id: 1,
                    created_by: socket?.user?.id,
                }, { transaction })
                if (!newEntryResult) {
                    throw new Error("error while creating stock out entry");
                }
                newEntryResult = jsonFormator(newEntryResult);
                const refId = newEntryResult.id;
                delete newEntryResult.id;
                const upadateTableResult = await PasteurizationDptUpdateModel.create({
                    ...newEntryResult,
                    activity: "New",
                    ref_table_id: refId,
                    created_by: socket?.user?.id
                }, { transaction })

                // insert data in admin table 

                const details = {
                    product_id: stockData.product_id,
                    quantity: totalQtyToBeDistibuted,
                    unit_id: stockData.unit_id,
                    pricePerUnit: 0,
                    db_table_name: "Pasteurization_Department",//current department table name
                    send_db_table_name: stockData.db_table_name,
                    db_table_id: refId,
                    in_departmenthead_id: socket.user.id,
                    in_department_id: socket.user.department_id,
                    send_department_id: stockData.department_id,
                    send_departmenthead_id: stockData.departmenthead_id,
                    ms_product_type_id: stockData.ms_product_type_id,
                    master_packing_size_id: stockData.master_packing_size_id ?? 0,
                    entry_type_id: 4,
                    bill_image: null,
                    created_by: socket.user.id,
                };
                // insert stock out deail in admin table
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


                if (!upadateTableResult) {
                    throw new Error("error while inserting stock out update table");
                }
                // to insert the same entry in silo department update table


            }

            await transaction.commit();
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Entries added successfully",
                    currentRoute,
                    totalQtyToBeDistibuted
                ),
            });
            // broad cast to admin
            BroadcastMethod.broadcastToAllRequiredClients({}, socket,
                io, currentRoute
            )
            pasteurizationDptControllers.fetchDatabyPdprtId(
                { pid: sourceId },
                socket,
                io,
                "pasteurization-dpt:get-data-by-id"
            );
        } catch (error) {
            await transaction.rollback(); // Rollback transaction in case of error
            console.error("ERROR =>>>>> :", error);
            socket.emit(currentRoute, {
                ...apiResponse.error(
                    false,
                    customMessage.wentWrong + " while inserting milk in silos",
                    currentRoute
                ),
            });
        }
    },
    async processSiloEntry(
        data,
        socket,
        transaction,
        currentRoute,
        siloSchema,
        sourceId
    ) {
        try {
            const { siloId, milkQty, milkStatus, trnsType } =
                await siloSchema.validate(data);
            const milkQuantity =
                trnsType === "in" ? parseFloat(milkQty) : parseFloat(milkQty) * -1;
            let siloData = await MasterPasteurizationSilosModel.findByPk(siloId, {
                transaction,
            });
            siloData = jsonFormator(siloData);
            // Check if silo is inactive
            if (!siloData.status) {
                socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `The silo '${siloData.silo_name}' is inactive.Please choose another silo or activate this one.`
                    ),
                });
                return false;
            }
            // Handle underflow case
            if (milkQuantity < 0) {
                const underFlow = siloUtils.underFlow(siloData, milkQuantity);
                if (underFlow.is) {
                    const { currentState } = underFlow;
                    socket.emit(currentRoute, {
                        ...apiResponse.error(false, underFlow.message, currentRoute, {
                            currentState,
                        }),
                    });
                    return false;
                }
            }
            // Handle overflow case
            if (milkQuantity > 0) {
                const overflow = siloUtils.overFlow(siloData, milkQuantity);
                if (overflow.is) {
                    const { currentState } = overflow;
                    socket.emit(currentRoute, {
                        ...apiResponse.error(false, overflow.message, currentRoute, {
                            currentState,
                        }),
                    });
                    return false;
                }
            }
            // Insert new entry into InfoSilosModel
            const insertResult = await PasteurizationInfoModel.create(
                {
                    mst_silos_id: siloId,
                    milk_quantity: milkQuantity,
                    milk_status: milkStatus,
                    trns_type: trnsType,
                    hold_quantity: trnsType == "out" ? sequelize.literal(`hold_quantity + ${milkQuantity}`) : siloData?.hold_quantity,
                    dpt_table_ref_id: sourceId,
                    created_by: socket.user.id,
                    milk_transfer_type: trnsType,
                },
                { transaction }
            );

            if (!insertResult) {
                throw new Error("Error while inserting milk data into InfoSilosModel");
            }

            // Update the total available milk in MasterSilosModel
            const [updateResult] = await MasterPasteurizationSilosModel.update(
                {
                    total_available_milk: Sequelize.literal(
                        `total_available_milk + ${milkQuantity}`
                    ),
                },
                {
                    where: { id: siloId },
                    transaction,
                }
            );
            if (!updateResult) {
                throw new Error(
                    "Error while updating total_available_milk in MasterSilosModel"
                );
            }
            return true;
        } catch (error) {
            console.error("ERROR =>>>>> :", error);
            if (error instanceof Yup.ValidationError) {
                socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
                return false;
            }
            throw new Error("Error while inserting milk ");
        }
    },
    async getAllMilkRecords(data, socket, io, currentRoute) {
        try {
            // get all milk records from
            let siloHistory = await PasteurizationInfoView.findAll({
                order: [["created_on", "DESC"]],
            });
            siloHistory = jsonFormator(siloHistory);



            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "silo recoreds fetched successfully !",
                    currentRoute,
                    siloHistory
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
};

export default pasteurizationSiloControllers;
