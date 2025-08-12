import { sequelize } from "../../config/dbConfig.js";
import { CustomerDeliveryBoyMappingModal } from "../../model/dairyModels/customerMapping.modal.js";
import { CustomerDeliveryBoyMappingUpdateModal } from "../../model/dairyModels/customerMappingUpdate.modal.js";
import { VkCustomerSubscriptionDetailsModal } from "../../model/dairyModels/customerSubscriptionView.modal.js";
import { UserModel } from "../../model/user.model.js";
import { UserDetailView } from "../../model/views/userView.model.js";
import { customMessage } from "../../utility/messages.util.js";
import { apiResponse } from "../../utility/response.util.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import Yup from "yup";
import customerControllers from "./customer.controller.js";
import { idSchema } from "../../yup-schemas/idSchema.schema.js";
import { DailyDeliverySchedulingModal } from "../../model/dairyModels/dailyDeliveryScheduling.modal.js";
import { DailyDeliveryBoyTransactionsModal } from "../../model/dairyModels/dailyDeliveryBoyTransction.modal.js";
// import { userSchema } from "../../yup-schemas/userdetail.schema.js";
const deliveryBoyController = {
    async getDeliveryBoy(data, socket, io, currentRoute) {
        try {
            let user = await UserDetailView.findAll({
                where: { role_id: 7, status: 1, dist_center_id: socket.user.distribution_center_id },
                order: [["created_on", "DESC"]],
            });
            user = jsonFormator(user);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    "true",
                    "user Details successfully",
                    currentRoute,
                    user
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getDeliveryBoyById(data, socket, io, currentRoute) {
        try {
            const { id } = data;
            if (!id && id < 1) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.idNull, currentRoute)
                });
            }
            let user = await UserDetailView.findAll({
                where: { id: id },
            });
            user = jsonFormator(user);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    "true",
                    "user Details successfully",
                    currentRoute,
                    user
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async deactiveDeliveryBoyById(data, socket, io, currentRoute) {
        try {
            const { id, status } = data;
            if (!id && id < 1) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.idNull, currentRoute)
                });
            }
            let updateStatus = await UserModel.update({
                status: status
            }, { where: { id: id } })
            if (!updateStatus) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.updErr, currentRoute)
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "User" + customMessage.updSucc, currentRoute)
            });
            return this.getDeliveryBoy(data, socket, io, "user:get-delivery-boy")
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async assignDeliveryboyToCstmr(data, socket, io, currentRoute) {
        try {
            const mappingSchema = Yup.object({
                // deliveryBoy: Yup.number()
                //     .typeError("Invalid Delivery Boy")
                //     .required("Delivery Boy is required"),
                customerId: Yup.number()
                    .required("Customer is required"),
            });
            const transaction = await sequelize.transaction();
            try {
                if (Array.isArray(data.customers)) {
                    const mappingData = [];
                    for (const customer of data.customers) {
                        const validationResult = await mappingSchema.validate(customer);
                        // Check if the customer is already assigned to a delivery boy
                        const existingMapping = await CustomerDeliveryBoyMappingModal.findOne({
                            where: {
                                customer_id: validationResult.customerId,
                            }
                        });
                        if (existingMapping) {
                            console.warn(`Customer ${validationResult.customerId} is already assigned to a delivery boy.`);
                            continue; // Skip this customer if already assigned
                        }
                        mappingData.push({
                            delivery_boy_id: data.deliveryBoy,
                            customer_id: validationResult.customerId,
                            created_by: socket.user.id
                        });
                    }
                    if (mappingData.length > 0) {
                        // Assign delivery boys to customers who were not already assigned
                        let assignResult = await CustomerDeliveryBoyMappingModal.bulkCreate(mappingData, { transaction });
                        if (!assignResult) {
                            console.error("Mapping not performed");
                        }
                        assignResult = jsonFormator(assignResult);
                        if (assignResult && assignResult.length > 0) {
                            const updateData = assignResult.map((assign) => {
                                let insertedId = assign.id;
                                delete assign.id;
                                return {
                                    ...assign,
                                    activity: "new",
                                    ref_table_id: insertedId
                                }
                            })
                            console.log("update table data =>", updateData)
                            const updateResult = await CustomerDeliveryBoyMappingUpdateModal.bulkCreate(updateData, { transaction })
                            console.log("update table result =>", updateResult)
                            if (!updateResult) {
                                throw new Error("error while inserting in update table")
                            }
                            await transaction.commit();
                            socket.emit(currentRoute, { ...apiResponse.success(true, "Delivery boy assigned successfully", currentRoute) });
                            return customerControllers.customerGetByDistId(data, socket, io, "customer:get-by-distCen-id")
                        }
                    } else {
                        return socket.emit(currentRoute, { ...apiResponse.error(false, "No new assignments made. All customers already assigned.", currentRoute) });
                    }
                } else {
                    const validationResult = await mappingSchema.validate(data.customers);
                    // Check if the single customer is already assigned to a delivery boy
                    const existingMapping = await CustomerDeliveryBoyMappingModal.findOne({
                        where: {
                            customer_id: validationResult.customerId,
                        }
                    });
                    if (existingMapping) {
                        console.warn(`Customer ${validationResult.customerId} is already assigned to a delivery boy.`);
                        return socket.emit(currentRoute, { ...apiResponse.error(false, `Customer ${validationResult.customerId} is already assigned to a delivery boy.`, currentRoute) });
                    }
                    let assignResult = await CustomerDeliveryBoyMappingModal.create({
                        delivery_boy_id: data.deliveryBoy,
                        customer_id: validationResult.customerId,
                        created_by: socket.user.id
                    }, { transaction });
                    const insertedId = assignResult.id;
                    delete assignResult.id;
                    const cloneTbleUpdate = await CustomerDeliveryBoyMappingUpdateModal.create({
                        ...assignResult,
                        ref_table_id: insertedId,
                        activity: "new"
                    }, { transaction });
                    if (!cloneTbleUpdate) {
                        throw new Error(
                            "Error while creating customer delivery boy mapping update table!!"
                        )
                    }
                    socket.emit(currentRoute, { ...apiResponse.success(true, "Delivery boy assigned successfully", currentRoute) });
                    return customerControllers.customerGetByDistId(data, socket, io, "customer:get-by-distCen-id")
                }
            } catch (error) {
                await transaction.rollback();
                console.error("ERROR =>", error)
            }
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(error, error.message, currentRoute, error)
            })
        }
    },
    async getCustomerByDeliveryBoy(data, socket, io, currentRoute) {
        try {
            const { deliveryBoyID } = data;
            if (!deliveryBoyID) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.badReq, currentRoute) })
            }
            let customerData = await VkCustomerSubscriptionDetailsModal.findAll({
                where: {
                    delivery_boy_id: deliveryBoyID,
                    dist_center_id: socket?.user?.distribution_center_id
                },
                order: [["created_on", "DESC"]],
            });
            if (!customerData) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.notFound, currentRoute) })
            }
            customerData = jsonFormator(customerData);
            return socket.emit(currentRoute, { ...apiResponse.success(true, "Customer" + customMessage.fetched, currentRoute, customerData) })
        } catch (error) {
            return socket.emit("error", { ...apiResponse.error(false, error.message, currentRoute, error) })
        }
    },
    // customer quantity change
    async scheduledQtyChangeByDLBoy(data, socket, io, currentRoute) {
        try {
            const quantity = Yup.object({
                deliveredQty: Yup.number("Invalid quantity").min(1, "Quantity should be greater than 1").required("Invalid quantity"),
                deliveryStatus: Yup.number("Invalid Status").required("Please select delivery Status")
            })
            const SchedulingSchema = idSchema.concat(quantity);
            let { deliveredQty, id, deliveryStatus } = await SchedulingSchema.validate(data);
            let isEntryExits = await DailyDeliverySchedulingModal.findOne({
                where: { id: id, status: true }
            });
            if (!isEntryExits) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Scheduling data is " + customMessage.notFound, currentRoute) })
            }
            const { delivery_boy_id: dlBoyId, product_id: productId } = jsonFormator(isEntryExits)
            // check if Issued qty is grater than delivered qty
            const currentDate = new Date().toISOString().split('T')[0]
            let getIssuedQty = await DailyDeliveryBoyTransactionsModal.findOne({
                where: {
                    delivery_boy_id: dlBoyId,
                    product_id: productId,
                    date: currentDate
                }
            })
            if (!getIssuedQty) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Delivery Boy Issued quantity not found!!", currentRoute) })
            }
            const { issued_total_quantity: IssuedQuantity, total_delivered_quantity: totalDeliveredQty, id: trnsTbleId } = jsonFormator(getIssuedQty);
            // if delicery boy cancel customer oreder then 
            if (deliveryStatus === 6) {
                deliveredQty = 0;
            }
            const checkAvailableQty = Number(IssuedQuantity) - Number(totalDeliveredQty)
            const availableQty = checkAvailableQty >= deliveredQty;
            if (!availableQty) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, `You only have ${checkAvailableQty} quantity available! Delivery not possible.`, currentRoute) })
            }
            const transaction = await sequelize.transaction();
            try {
                let updateQty = await DailyDeliverySchedulingModal.update({
                    delivered_quantity: deliveredQty,
                    updated_by: socket.user.id,
                    status: deliveryStatus
                }, { where: { id: id }, transaction });
                if (!updateQty) {
                    return socket.emit(currentRoute, { ...apiResponse.error(false, "Quantity not updated!!", currentRoute) })
                }
                // update daily delivery boy transction table 
                let updateTotalQtyBalance = await DailyDeliveryBoyTransactionsModal.update({
                    total_delivered_quantity: Number(totalDeliveredQty) + Number(deliveredQty)
                }, { where: { id: trnsTbleId }, transaction });
                if (!updateTotalQtyBalance) {
                    throw new Error("Error While Updating Daily Delivery Boy Transactions table")
                }
                // create after delivery success auto create a entry 
                // if (deliveryStatus !== 4) {

                // }
                // complete all proccess then commit transction----
                await transaction.commit()
                return socket.emit(currentRoute, { ...apiResponse.success(true, "Delivered Quantity change successfully!!", currentRoute) })
            } catch (error) {
                await transaction.rollback();
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute, error) })
            }
        } catch (error) {
            return socket.emit(error, { ...apiResponse.error(false, error.message, currentRoute, error) })
        }
    },
    /*  async createCustomerByDeliveryBoy(data, socket, io, currentRoute) {
    try {
    console.table(socket.user)
    const pickedSchema = userSchema.pick(['full_name', 'email', 'mobile', 'address', 'city', 'state', 'pincode']);
    const { full_name, email, mobile, address, city, state, pincode } = await pickedSchema.validate(data);
    // check if user already exists perticular distribution center ------
    let isExistsCustomer = await UserModel.findOne({
    where: {
    mobile: mobile,
    }
    });
    if (isExistsCustomer) {
    return socket.emit(currentRoute, { ...apiResponse.error(false, `${full_name} is` + customMessage.exists, currentRoute) })
    }
    let createCustomer = await UserModel.create({
    full_name: full_name,
    email: email,
    mobile: mobile,
    address: address,
    city: city,
    state: state,
    pincode: pincode,
    status: 0,
    password: mobile,
    created_by: socket.user.delivery_boy_id,
    dist_center_id: socket.user.distribution_center_id
    });
    if (!createCustomer) {
    return socket.emit(currentRoute, { ...apiResponse.error(false, `Customer ${full_name} is not created`) })
    }
    return socket.emit(currentRoute, { ...apiResponse.success(true, `Customer ${full_name} created successfully`, currentRoute) })
    } catch (error) {
    return socket.emit(error, { ...apiResponse.error(false, error.message, currentRoute, error) })
    }
    }*/
}
export default deliveryBoyController

