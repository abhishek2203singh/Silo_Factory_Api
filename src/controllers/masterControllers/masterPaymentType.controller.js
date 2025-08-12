import Yup from "yup";
import { MasterPaymentTypeModal } from "../../model/masterPaymentType.js";
import { apiResponse } from "../../utility/response.util.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { customMessage } from "../../utility/messages.util.js";
const masterPaymentTypeController = {
    async createPaymentType(data, socket, io, currentRoute) {
        try {
            const paymentTypeSchema = Yup.object({
                transtionModeName: Yup.string().required("Please, Enter TranstionModeName !!"),
                priorityLevel: Yup.string().oneOf(['permanent', 'temporary'], 'Please select PaymentType priority level like , permanent or temporary')
            });
            const { transtionModeName, priorityLevel } = await paymentTypeSchema.validate(data);
            const paymentTypeExists = await MasterPaymentTypeModal.findOne({
                where: {
                    name: transtionModeName
                }
            });
            if (paymentTypeExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, `Payment Type Name ${transtionModeName} already exists!!`)
                });
            }
            let paymentTypeResult = await MasterPaymentTypeModal.create({
                name: transtionModeName,
                is_deletable: priorityLevel == 'permanent' ? false : true
            });
            if (!paymentTypeResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, `Failed to create payment type !!`, currentRoute)
                });
            }
            paymentTypeResult = jsonFormator(paymentTypeResult);
            socket.emit(currentRoute, {
                ...apiResponse.success(true, `Payment type ${transtionModeName} created successfully!!`)
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error)
            })
        }
    },
    async updatePaymentType(data, socket, io, currentRoute) {
        try {
            const paymentTypeSchema = Yup.object({
                paymentTypeId: Yup.number(customMessage.badReq).required(customMessage.badReq),
                transtionModeName: Yup.string().required("Please, Enter TranstionModeName !!"),
                priorityLevel: Yup.string().oneOf(['permanent', 'temporary'], 'Please select PaymentType priority level like , permanent or temporary')
            });
            const { paymentTypeId, transtionModeName, priorityLevel } = await paymentTypeSchema.validate(data);
            let isExists = await MasterPaymentTypeModal.findOne({
                where: {
                    id: paymentTypeId
                }
            });
            if (!isExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, 'Payment type not found !!', currentRoute)
                });
            }
            let [updateResult] = await MasterPaymentTypeModal.update({
                name: transtionModeName,
                is_deletable: priorityLevel == "permanent" ? false : true,
            },
                {
                    where: {
                        id: paymentTypeId
                    }
                }
            );
            if (!updateResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Payment type not updated !!", currentRoute)
                })
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, `Payment type ${transtionModeName} updated successfully !!`)
            })
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error)
            })
        }
    },
    async getPaymentTypeById(data, socket, io, currentRoute) {
        try {
            const { paymentTypeId = false } = data;
            if (!paymentTypeId || paymentTypeId < 1) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute)
                });
            }
            let paymentTypeById = await MasterPaymentTypeModal.findOne({
                where: {
                    id: paymentTypeId
                }
            });
            if (!paymentTypeById) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, 'Payment type not found !!', currentRoute, 'Payment type not found !!')
                });
            }
            paymentTypeById = jsonFormator(paymentTypeById);
            socket.emit(currentRoute, {
                ...apiResponse.success(true, 'Payment type fetched successfully!!', currentRoute, paymentTypeById)
            })
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error)
            })
        }
    },
    async getAllPaymentType(data, socket, io, currentRoute) {
        // Define the query condition to filter only active product types
        const condition = {
            where: {
                status: true,
            },
            order: [["created_on", "DESC"]], // Fixed the order syntax
        };
        try {
            let allPaymentTypeData = await MasterPaymentTypeModal.findAll(condition);
            allPaymentTypeData = jsonFormator(allPaymentTypeData);
            socket.emit(currentRoute, {
                ...apiResponse.success(true, 'Payment type fetched successfully!!', currentRoute, allPaymentTypeData)
            });
        }
        catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error)
            })
        }
    }
}
export default masterPaymentTypeController;