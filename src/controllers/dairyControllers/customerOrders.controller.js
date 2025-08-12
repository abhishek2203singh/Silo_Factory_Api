import { apiResponse } from "../../utility/response.util.js";
import Yup from 'yup';
import { oderSchema } from "../../yup-schemas/dairySchemas/customerOrder.schema.js";
import { ProductModel } from "../../model/product.model.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { customMessage } from "../../utility/messages.util.js";
import { CustomerOrdersModel } from "../../model/dairyModels/customerOrders.model.js";
import sequelize from "sequelize";
import { orderGenerator } from "../../utility/orderGenerator.util.js";
import { idSchema } from "../../yup-schemas/idSchema.schema.js";
import { MasterPackingSizeModel } from "../../model/masterPackingSize.model.js";
import { CustomerDeliveryBoyMappingModal } from "../../model/dairyModels/customerMapping.modal.js";
import { CustomerOrdersViewModel } from "../../model/dairyModels/customerOrderView.model.js";
import { currentUser } from "../../utility/currentUser.utils.js";
import { MasterSchedulingStatusModel } from "../../model/masterSchedulingStatus.model.js";
import { UserModel } from "../../model/user.model.js";
const customerOrdersController = {
    // to create new order 
    async addNewOrder(data, socket, io, currentRoute) {
        try {
            const { productId, quantity, deliveryDate, packingSize } = await oderSchema.validate(data);
            // check wether valid product is selected 
            // check product price
            // calculate total
            // fetch default delivery boy
            // fetch product details 
            const productDetails = jsonFormator(await ProductModel.findOne({
                where: {
                    id: productId,
                    status: true,
                    ms_product_type_id: 3
                }
            }));
            if (!productDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Invalid product please select a valid product", currentRoute),
                });
            }
            // check wehter valid packing size is selected 
            if (productId !== 30 && packingSize == 0) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "please select packing size !", currentRoute),
                });
            }
            // if product is not milk and quantity is alos not an integer value
            if (productId !== 30 && !Number.isInteger(quantity)) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Invalid quantity please enter an intiger value like 1,5,3", currentRoute),
                });
            }
            let packingDetails = null;
            if (productId !== 30) {
                packingDetails = jsonFormator(await MasterPackingSizeModel.findOne({
                    where: {
                        id: packingSize,
                        product_id: productId
                    }
                }));
                if (!packingDetails) {
                    return socket.emit(currentRoute, {
                        ...apiResponse.error(false, "Invalid packing size", currentRoute),
                    });
                }
            }
            // fetch default delivery boy of the current customer
            const deliveryBoyDetails = jsonFormator(await CustomerDeliveryBoyMappingModal.findOne({
                where: {
                    customer_id: socket.user.id,
                    customer_subscriptions_id: 0
                }
            }));
            // if (!cusomerDetails) {
            //     return socket.emit(currentRoute, {
            //         ...apiResponse.error(false, customMessage.cantPerform, currentRoute),
            //     });
            // }
            let totalPrice = 0;
            // if product have packing size then totlpeice will be calculated according to packing else according to product
            if (packingDetails) {
                totalPrice = Number(packingDetails.mrp * quantity).toFixed(2);
            }
            else {
                totalPrice = Number(productDetails.mrp * quantity).toFixed(2);
            }
            // to generate a random order no 
            const order_id = orderGenerator();
            console.log({
                totalPrice,
                packingDetails,
                productDetails
            })
            // insert data in customer_orders table
            const orderResult = jsonFormator(await CustomerOrdersModel.create({
                user_id: socket.user.id,
                product_id: productId,
                quantity,
                status: true,
                price: packingDetails ? packingDetails.mrp : productDetails.mrp,
                delivery_charge: productDetails.delivery_charge,
                delivery_status: 3,//processing
                total_price: totalPrice,
                requested_delivery_date: deliveryDate,
                master_packing_size_id: packingSize,
                order_date: sequelize.literal("CURRENT_TIMESTAMP"),
                order_id,// randorm id
                delivery_boy_id: deliveryBoyDetails ? deliveryBoyDetails?.delivery_boy_id : 0,
                distribution_center_id: socket.user.distribution_center_id,
                created_by: socket.user.id,
            }))
            if (!orderResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, `${productDetails.product_name} ordered successfully , order id :${order_id}`, currentRoute, null)
            });
            // TODO : broad cast for distribution center
            this.allOrders(data, socket, io, "customer-order:all")
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
    async cancelOrder(data, socket, io, currentRoute) {
        try {
            const { id } = await idSchema.validate(data);
            // check wether this order is created by current customer
            const orderDetails = jsonFormator(await CustomerOrdersModel.findOne({
                where: {
                    order_id: id,
                    user_id: socket.user.id,
                }
            }));
            if (!orderDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "order details " + customMessage.notFound, currentRoute),
                });
            }
            // if order is already cancelld
            if (!orderDetails.status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "order is already cancelled", currentRoute),
                });
            }
            // if order is delivered 
            if (orderDetails.delivery_status === 4) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "order is already delivered", currentRoute),
                });
            }
            // cancel order
            const [cancelResult] = await CustomerOrdersModel.update({
                status: false,
                updated_by: socket.user.id,
                updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
            }, {
                where: {
                    order_id: id,
                }
            })
            if (!cancelResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, `order cancelled successfully ! order id : ${id} `, currentRoute),
            });
            this.allOrders(data, socket, io, "customer-order:all")
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
    // all orders which will be returned according to logged in user if distribution center is logged in than all the respective orders will be returned
    async allOrders(data, socket, io, currentRoute) {
        try {
            const user = currentUser(socket.user);
            if (!user.isCustomer && !user.isDeliveryBoy && !user.isDistrubution) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "You are not authorized to perform this action", currentRoute),
                });
            }
            // if logged in user is customer
            const customerCondition = {
                cust_id: socket.user.id
            }
            // if logged in user is delivery boy
            const deliveryBoyCondition = {
                delivery_boy_id: socket.user.id
            }
            // if logged in user is distribution center
            const distCondition = {
                distribution_center_id: socket.user.distribution_center_id
            }
            // const orders =await 
            const orders = await CustomerOrdersViewModel.findAll({
                where: user.isDistrubution ? distCondition : user.isCustomer ? customerCondition : deliveryBoyCondition,
                order: [["order_date", "DESC"]],
            })
            socket.emit(currentRoute, { ...apiResponse.success(true, "Orders " + customMessage.fetched, currentRoute, orders) })
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
    // to change delivery status
    async changeDeliveryStatus(data, socket, io, currentRoute) {
        console.log("changeDeliveryStatus", data)
        try {
            const user = currentUser(socket.user);
            if (!user.isDeliveryBoy && !user.isDistrubution) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "You are not authorized to perform this action", currentRoute),
                });
            }
            const deliVeryStatusScheam = Yup.object({
                status: Yup.number().typeError("please select valid delivery status").required("delivery status is not selected !"),
                note: Yup.string().default("")
            }).concat(idSchema);
            const { status, id, note } = await deliVeryStatusScheam.validate(data);
            const orderDetails = jsonFormator(await CustomerOrdersModel.findOne({
                where: {
                    order_id: id
                }
            }));
            const statusDetails = jsonFormator(await MasterSchedulingStatusModel.findByPk(status));
            if (!statusDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Invalid delivery status , please select a valid delivery status", currentRoute),
                });
            }
            console.log("status details =>", statusDetails)
            // if order details not found
            if (!orderDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "order details not found", currentRoute),
                });
            }
            // if delivery status is same as current status
            if (orderDetails.delivery_status === status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, `order is already ${statusDetails.status}`, currentRoute),
                });
            }
            // if order is cancelled
            if (!orderDetails.status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "order is cancelled by customer", currentRoute),
                });
            }
            // if order is returned 
            if (orderDetails.delivery_status === 5) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "status of returned order can't be changed !", currentRoute),
                });
            }
            // is order already delivered
            if (orderDetails.delivery_status === 4) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "order is already delivered !", currentRoute),
                });
            }
            const [updateResult] = await CustomerOrdersModel.update({
                delivery_status: status,
                updated_by: socket.user.id,
                updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                note
            }, {
                where: {
                    order_id: id,
                }
            })
            if (!updateResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
            socket.emit(currentRoute, { ...apiResponse.success(true, ` order : ${id}  ${statusDetails.status} successfully !`) })
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
    // to assign / replace a delivery for a perticular order
    async assignDeliveryBoy(data, socket, io, currentRoute) {
        try {
            const user = currentUser(socket.user);
            if (!user.isDistrubution) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "You are not authorized to perform this action", currentRoute),
                });
            }
            const changeDeliveryBoySchema = Yup.object({
                deliveryBoy: Yup.number().typeError("please select a valid deliver boy").required('delivery boy is required !')
            }).concat(idSchema)
            const { id, deliveryBoy } = await changeDeliveryBoySchema.validate(data);
            // find out delivery boy details
            const deliveryBoyDetails = jsonFormator(await UserModel.findOne({
                where: {
                    id: deliveryBoy,
                    dist_center_id: socket.user.distribution_center_id
                }
            }))
            if (!deliveryBoyDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "invalid delivery boy selected ", currentRoute),
                });
            }
            // id delivery boy is disabled 
            if (!deliveryBoyDetails.status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, `delivery boy '${deliveryBoyDetails.full_name}' is disabled please activate  to assign for this delivery !`, currentRoute),
                });
            }
            const orderDetails = jsonFormator(await CustomerOrdersModel.findOne({
                order_id: id,
                dist_center_id: socket.user.distribution_center_id
            }));
            // order detail is  not found 
            if (!orderDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "order details not found", currentRoute),
                });
            }
            if (!orderDetails.status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "order is cancelled by customer", currentRoute),
                });
            }
            // if order is already delivered 
            if (orderDetails.delivery_status === 4) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "order is already delivered", currentRoute),
                });
            }
            // if current delivery boy and new delivery boy are same
            if (orderDetails.delivery_boy_id == deliveryBoy) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, `order : ${id} is already assigned to '${deliveryBoyDetails.full_name}'  `, currentRoute),
                });
            }
            // get details of current details
            const currentDeliverBoy = jsonFormator(await UserModel.findOne({
                where: {
                    id: orderDetails.delivery_boy_id,
                    dist_center_id: socket.user.distribution_center_id
                }
            }))
            // if delivery boy is prviously asssigned and then replace 
            if (orderDetails.delivery_boy_id) {
                const [replaceResult] = await CustomerOrdersModel.update({
                    delivery_boy_id: deliveryBoy,
                    updated_by: socket.user.id,
                    updated_on: sequelize.literal("CURRENT_TIMESTAMP")
                }, {
                    where: {
                        order_id: id
                    }
                })
                if (!replaceResult) {
                    return socket.emit(currentRoute, {
                        ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                    });
                }
                return socket.emit(currentRoute, { ...apiResponse.success(true, ` for order : ${id} delivery boy  '${currentDeliverBoy.full_name}' is successfully replaced with  '${deliveryBoyDetails.full_name}' `) })
            }
            // if delivery boy not assigned then assign new 
            const [assignResult] = await CustomerOrdersModel.update({
                delivery_boy_id: deliveryBoy,
                updated_by: socket.user.id,
                updated_on: sequelize.literal("CURRENT_TIMESTAMP")
            }, {
                where: {
                    order_id: id
                }
            })
            if (!assignResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, `order : ${id}  assigned to ${deliveryBoyDetails.full_name} successfully !`)
            })
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
    }
}
export default customerOrdersController;

