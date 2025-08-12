import Yup from "yup";
import { InfoSilosModel } from "../model/infoSilos.model.js";
import { apiResponse } from "../utility/response.util.js";
import { sequelize } from "../config/dbConfig.js";
import { siloUtils } from "../utility/silo.util.js";
import { MasterSilosModel } from "../model/masterSilos.model.js";
import { customMessage } from "../utility/messages.util.js";
import { jsonFormator } from "../utility/toJson.util.js";
import Sequelize from "sequelize";
import { SiloDepartmentModal } from "../model/silodDepartment.modal.js";
import { SiloDepartmentUpdateModel } from "../model/siloDepartmentUpdate.model.js";
import { insertInsiloSchema } from "../yup-schemas/insertInSilo.schema.js";
import silosDepartmentControllers from "./silosdepartment.controller.js";
import { SiloInfoView } from "../model/views/siloInfoModel.View.js";
import commonControllers from "./common.controller.js";

const silosControllers = {
    // insert new entry in silo

    async insertInSilo(data, socket, io, currentRoute) {
        const transaction = await sequelize.transaction();
        try {
            const { sourceId = false } = data;
            if (!sourceId) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute),
                });
            }
            let stockData = await SiloDepartmentModal.findByPk(sourceId);
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
            const {
                quantity: originalQuantity,
                distributed_quantity: distibutedQty,
                approval_status_id,
            } = stockData;
            console.log("STOCK DATA =>", stockData)
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
            //   if totalQtyToBeDistibuted is greater than originalQuantity
            if (totalQtyToBeDistibuted > originalQuantity - distibutedQty) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `Distribution quantity must not be greater than remaining/original quantity ${originalQuantity - distibutedQty
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
                    data,
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
            // Commit the transaction if all entries are processed successfully
            let [distributedQtyUpdate] = await SiloDepartmentModal.update(
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
            console.log(distributedQtyUpdate);
            if (!distributedQtyUpdate) {
                throw new Error("error while updating distibuted quantity");
            }
            delete stockData.id;
            console.log(stockData);
            // to insert the same entry in silo department update table
            const finalEntry = await SiloDepartmentUpdateModel.create(
                {
                    ...stockData,
                    activity: "update",
                    distributed_quantity: parseFloat(totalQtyToBeDistibuted).toFixed(
                        2
                    ),
                    created_by: socket?.user?.id,
                    db_table_id: sourceId,
                    db_table_name: "Silo_Department",
                    ref_table_id: sourceId,
                },
                { transaction }
            );
            if (!finalEntry) {
                throw new Error("error while inserting entry in update table");
            }


            // entry was type of request then create a new entry for stock out
            if (stockData.entry_type_id == 2) {
                const upcomingId = await SiloDepartmentModal.max('id') + 1
                console.log("upcomming id=>", upcomingId);
                // create a stock out entry
                let newEntryResult = await SiloDepartmentModal.create({
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
                const upadateTableResult = await SiloDepartmentUpdateModel.create({
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
                    db_table_name: "Silo_Department",
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
            silosDepartmentControllers.fetchDatabySilodprtId(
                { silDId: sourceId },
                socket,
                io,
                "silos-dpt:get-data-by-id"
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
    //   function to process entry
    async processSiloEntry(
        data,
        socket,
        transaction,
        currentRoute,
        siloSchema,
        sourceId
    ) {
        try {
            console.log("validation data =>", data);
            // return;
            const { siloId, milkQty, milkStatus, trnsType } =
                await siloSchema.validate(data);

            const origianlMilkQuantity = Number(milkQty);
            const milkQuantity =
                trnsType === "in" ? Number(milkQty) : Number(milkQty) * -1;

            let siloData = await MasterSilosModel.findByPk(siloId, { transaction });
            siloData = jsonFormator(siloData);

            // Check if silo is inactive
            if (!siloData.status) {
                socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `The silo '${siloData.silo_name}' is inactive. Please choose another silo or activate this one.`
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
            const insertResult = await InfoSilosModel.create(
                {
                    mst_silos_id: siloId,
                    milk_quantity: milkQuantity,
                    milk_status: milkStatus,
                    trns_type: trnsType,
                    // hold_quantity: trnsType == "out" ? Number(siloData.hold_quantity) + origianlMilkQuantity : 0.00,
                    dpt_table_ref_id: sourceId,
                    created_by: socket.user.id,
                },
                { transaction }
            );

            if (!insertResult) {
                throw new Error("Error while inserting milk data into InfoSilosModel");
            }

            // if stock is comming

            if (trnsType == "in") {
                // Update the total available milk in MasterSilosModel
                const [updateResult] = await MasterSilosModel.update(
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
            }

            // if stock is out going 
            if (trnsType == "out") {

                // Update the total available milk in MasterSilosModel
                const [updateResult] = await MasterSilosModel.update(
                    {
                        total_available_milk: Sequelize.literal(
                            `total_available_milk - ${origianlMilkQuantity}`
                        ),
                        // hold_quantity: sequelize.literal(`hold_quantity + ${origianlMilkQuantity}`)
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
    //   async updateEntry(data, socket, io, currentRoute) {
    //     try {
    //     } catch (error) {
    //       if (error instanceof Yup.ValidationError) {
    //         return socket.emit(currentRoute, {
    //           ...apiResponse.error(false, error.message, currentRoute, error),
    //         });
    //       }
    //       socket.emit("error", {
    //         ...apiResponse.error(false, error.message, currentRoute, error),
    //       });
    //     }
    //   },
    async getAllSiloInfoData(data, socket, io, currentRoute) {
        try {
            let siloInfoResult = await SiloInfoView.findAll({
                order: [["silo_info_created_on", "DESC"]],
            });


            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Silo Info Data",
                    currentRoute,
                    siloInfoResult
                ),
            });
        } catch (error) {
            console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
};

export default silosControllers;
