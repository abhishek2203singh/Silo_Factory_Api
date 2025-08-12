import Yup from "yup";
import { CustomerSubscriptionModel } from "../../model/dairyModels/customerSubscriptions.model.js";
import { CustomerSubscriptionViewModel } from "../../model/views/dairyViews/customerSubscriptionView.model.js";
import { apiResponse } from "../../utility/response.util.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { idSchema } from "../../yup-schemas/idSchema.schema.js";
import { ProductModel } from "../../model/product.model.js";
import { MasterPackingSizeModel } from "../../model/masterPackingSize.model.js";
import { subscriptionSchema } from "../../yup-schemas/dairySchemas/customerSubscription.schema.js";
import Sequelize from "sequelize";
import { sequelize } from "../../config/dbConfig.js";
import { customMessage } from "../../utility/messages.util.js";
import { CustomerSubscriptionsUpdateModel } from "../../model/dairyModels/customerSubsctiptionUpdate.model.js";
import { UserModel } from "../../model/user.model.js";
const customerSubscriptionControllers = {
    // create / add new subscriptions for customers
    async createNewSubscriptions(data, socket, io, currentRoute) {
        try {
            console.log(data)
            const { id, role_id, department_id, distribution_center_id } = socket.user;
            let customerId = 0
            let isDistCenterLogggedIn = false
            // if logged in user is distribution center 
            if (department_id === 6 && role_id === 12) {
                customerId = 0;
                isDistCenterLogggedIn = true;
            }
            // if logged in user is delivery boy
            else if (department_id === 6 && role_id === 7) {
                customerId = 0
            }
            else {
                customerId = id
            }
            // check wether a delivery boy is selected or not 
            // if ditribution center is creating subscription then it is required to select a delivery boy 
            if (department_id === 6 && role_id === 12 && data.deliveryBoyId === 0) {
                return socket.emit(currentRoute, {
                    success: false,
                    message: "Please select a delivery boy",
                    data: null,
                });
            }
            // parese ids of all selected delivery boys
            //parse all ids of selected products 
            const { customerId: custId, subscriptions } = data;
            if (Array.isArray(subscriptions)) {
                // validate all subscriptions  and formate for insertion into customer subscription table
                const validatedData = await Promise.all(subscriptions.map(async (subscriptionDetail, index) => {
                    try {
                        const validationResult = await subscriptionSchema.validate(subscriptionDetail);
                        const {
                            deliveryBoyId,
                            productId,
                            quantity,
                            userPrice,
                            allDay,
                            alternateDay,
                            specificDay,
                            regularDay,
                            shift,
                            sunday,
                            monday,
                            tuesday,
                            wednesday,
                            thursday,
                            friday,
                            saturday,
                        } = validationResult
                        return {
                            product_id: productId,
                            quantity,
                            delivery_boy_id: deliveryBoyId,
                            sunday,
                            monday,
                            tuesday,
                            wednesday,
                            thursday,
                            friday,
                            saturday,
                            shift,
                            alternate_day: alternateDay,
                            specific_day: specificDay,
                            regular_day: regularDay,
                            all_days: allDay,
                            user_id: custId,
                            user_price: userPrice,
                            created_by: socket.user.id,
                            distribution_center_id: distribution_center_id,
                            created_at: sequelize.literal("CURRENT_TIMESTAMP")
                        }
                    } catch (error) {
                        console.error("Error in validation =>", error);
                        socket.emit(currentRoute, { ...apiResponse.error(false, error.message + ` at subscription no  ${index}`) })
                    }
                }))
                // parse the ids of products which user want to subscribe 
                const products = await validatedData.map((subsc) => subsc.productId);
                // parse the ids of delivery boys 
                let deliveryBoys = validatedData.map((subsc) => subsc.deliveryBoyId);
                deliveryBoys = [... new Set(deliveryBoys)]
                console.log(deliveryBoys)
                // check wether delivery boy is active or belogs to current dairy
                // check wether any of the subsctiption is exists 
                const isExistingSubsction = await CustomerSubscriptionViewModel.findAll({
                    where: {
                        userId: custId,
                        productId: products
                    }
                })
                // if subscription is found
                if (isExistingSubsction.length) {
                    // to collect name of all products 
                    const productsName = isExistingSubsction.map((product) => product.product_name).join(",");
                    console.log("productsName :", productsName);
                    return socket.emit(currentRoute, {
                        ...apiResponse.error(false,
                            `You already have subscription for ${productsName}`,
                            currentRoute)
                    });
                }
                const transaction = await sequelize.transaction();
                try {
                    // insert subscription data into customer subscription table 
                    const subscriptionResult = await CustomerSubscriptionModel.bulkCreate(validatedData, { transaction });
                    // if subsctiptions is not created as requested 
                    if (validatedData.length !== subscriptionResult.length) {
                        socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute) });
                        throw new Error(`requersted subscriptions ${validatedData.length} are not equal to subscripbed subscriptions  ${subscriptionResult.length}`)
                    }
                    // formate subscription to insert data into update table 
                    const updateDataTableData = subscriptionResult.map((sub) => {
                        const refId = sub.id;
                        delete subscriptionResult.id;
                        return {
                            ...sub,
                            ref_table_id: refId,
                        }
                    });
                    // insert data into customer_subscription_update table
                    const updateResult = await CustomerSubscriptionsUpdateModel.bulkCreate(updateDataTableData, { transaction });
                    if (updateResult.length !== updateDataTableData.length) {
                        throw new Error(` updated result ${updateResult.length} if not equal to requested  ${updateDataTableData.length} `)
                    }
                    // if all operation is successful
                    await transaction.commit();
                    socket.emit(currentRoute, { ...apiResponse.success(true, validatedData.length + " subscriptions added successfully !", currentRoute) });
                    // await transaction.rollback();
                }
                catch (error) {
                    console.error("Error =>", error)
                    await transaction.rollback();
                    return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute, error) })
                }
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
    // update subscription
    async updateSubscription(data, socket, io, currentRoute) {
        try {
            console.log(data)
            // check wether the logged in user is distribution center
            const isDistCenterLogggedIn = (socket.user.role_id === 12 && socket.user.department_id == 6) ? true : false;
            // extract details 
            const { customer_id: currentCustomer } = socket.user;
            const subscriptionUpdateSchema = subscriptionSchema.concat(idSchema);
            const custIdSchema = Yup.object({
                customerId: Yup.number().typeError("Please select a valid customer ").min(1, customMessage.badReq).required("please select customer")
            })
            const { customerId: providedCustomerId, subscriptions } = data;
            // validate data
            const { customerId } = await custIdSchema.validate({ customerId: providedCustomerId ? providedCustomerId : currentCustomer });
            // check whether the selected customer is belongs to the current distributin center if logged in user is distribution center
            if (isDistCenterLogggedIn) {
                const isValidCustomer = await UserModel.findOne({
                    where: {
                        id: customerId,
                        dist_center_id: socket.user.distribution_center_id,
                    }
                })
                // if customer is not belogs to current distribution center
                if (!isValidCustomer) {
                    return socket.emit(currentRoute, {
                        ...apiResponse
                            .error(false, "Invalid customer selected ", currentRoute)
                    }
                    )
                }
            }
            const transaction = await sequelize.transaction();
            // if user / distribution center want to update multiple subscriptions at a time
            if (Array.isArray(subscriptions)) {
                const subscriptionValidations = await Promise.all(subscriptions.map(async (sub) => {
                    const validationResult = await subscriptionUpdateSchema.validate(sub);
                    return validationResult;
                }));
                // const updateTableData=[];
                const dataForUpdateTable =
                    await Promise.all(subscriptionValidations.map(async (validationResult) => {
                        const result = await updateSubscriptionHandler(validationResult, customerId, isDistCenterLogggedIn, transaction, socket, currentRoute)
                        if (!result) {
                            return false;
                        }
                        const refId = result.id;
                        delete result.id;
                        return {
                            ...result, activity: "Update",
                            ref_table_id: refId,
                            created_on: sequelize.literal("CURRENT_TIMESTAMP"),
                            created_by: socket.user.id
                        }
                    }));
                // check if all the data is updated in customer subscription table 
                if (dataForUpdateTable.length !== subscriptionValidations.length) {
                    throw new Error("error while updating subscriptions in customer subscription table");
                }
                // insert data inupdate table
                let updateTableResult = await CustomerSubscriptionsUpdateModel.bulkCreate(dataForUpdateTable, transaction);
                if (!updateTableResult) {
                    throw new Error("error while inserting data in update table");
                }
                updateTableResult = jsonFormator(updateTableResult);
                if (updateTableResult.length !== subscriptionValidations.length) {
                    throw new Error("error while updating data in update table");
                }
                await transaction.commit();
                return socket.emit(currentRoute, {
                    success: true,
                    message: "Subscription updated successfully",
                })
            }
            // incase single subscription update
            const validationResult = await subscriptionUpdateSchema.validate(subscriptions);
            // updated data in customer subscription table
            const currentData = await updateSubscriptionHandler(validationResult, customerId, isDistCenterLogggedIn, transaction, socket, currentRoute);
            if (!currentData) {
                throw new Error("error while updating subscription in customer subscription table");
            }
            // insert in customer subscription update table
            // const refId = currentData.id;
            // delete currentData.id;
            const updateTableResult = await CustomerSubscriptionsUpdateModel.create({
                ...currentData,
                // ref_table_id: refId
            }, { transaction })
            if (!updateTableResult) {
                throw new Error("error while inserting data in update table");
            }
            // commit transaction 
            await transaction.commit();
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "subscription updated successfully !!")
            }
            )
        }
        catch (error) {
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
    // stop single subscription 
    async stopSubscription(data, socket, io, currentRoute) {
        try {
            const { customer_id: currentCustomer } = socket.user;
            // if logged in user is customer then customer_id will be customer id else 0
            const { subscriptions, customerId: providedCustomerId } = data;
            // if logged in user is disteribution center owner 
            const isDistCenterLogggedIn = (socket.user.role_id === 12 && socket.user.department_id == 6) ? true : false;
            // if distribution center is logged in the verify that a valid customer is selected
            if (isDistCenterLogggedIn) {
                const isValidCustomer = await UserModel.findOne({
                    where: {
                        id: customerId,
                        dist_center_id: socket.user.distribution_center_id,
                    }
                })
                // if customer is not belogs to current distribution center
                if (!isValidCustomer) {
                    return socket.emit(currentRoute, {
                        ...apiResponse
                            .error(false, "Invalid customer selected ", currentRoute)
                    }
                    )
                }
            }
            // schema for customer_id validation
            const custIdSchema = Yup.object({
                customerId: Yup.number().typeError("Please select a valid customer ").min(1, customMessage.badReq).required("please select customer")
            })
            // validate data
            const { customerId } = await custIdSchema.validate({ customerId: providedCustomerId ? providedCustomerId : currentCustomer });
            // check whether the subscriptions are multiple \\
            if (Array.isArray(data.subscriptions)) {
                // start transaction 
                const transaction = await sequelize.transaction();
                try {
                    // validate all subscriptions 
                    // formate data for bulk insert in update table
                    // stop all subscriptions in customer
                    // extract all subscription data and formate that
                    // const subscriptionIds = []
                    const subscriptionIds = await Promise.all(subscriptions.map(async (reqtedId) => {
                        // we assums that if customerid is not provide then the logged in user is customer itself
                        console.log(reqtedId)
                        const { id } = await idSchema.validate({ id: reqtedId });
                        return id;
                        // subscriptionIds.push(await id)
                    }))
                    console.log("subscription will be stoped for ", { subsIds: subscriptionIds.length, customerId })
                    // find all active subscriptions according to provided id's 
                    let activeSubscriptions = await CustomerSubscriptionModel.findAll({
                        where: {
                            id: subscriptionIds,
                            user_id: customerId,
                            status: true
                        }
                    })
                    activeSubscriptions = jsonFormator(activeSubscriptions);
                    console.table(activeSubscriptions)
                    console.log("active subscriptions: ", activeSubscriptions.length, "requested =>", subscriptionIds.lenght)
                    // if provided subscription are not equal to the active subscriptions 
                    if (subscriptionIds.length !== activeSubscriptions.length) {
                        return socket.emit(currentRoute, {
                            ...apiResponse.error(false, customMessage.cantPerform, currentRoute)
                        })
                    }
                    // formate active subscriptos data for update table
                    const dataForUpdate = activeSubscriptions.map((sub) => {
                        const refId = sub.id;
                        delete sub.id;
                        return {
                            ...sub,
                            activity: "Multiple Subscription Stoped",
                            ref_table_id: refId,
                            status: false,
                            created_on: sequelize.literal("CURRENT_TIMESTAMP"),
                            updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                            created_by: socket.user.id
                        }
                    })
                    // stop all subscriptions in bulk
                    const [bulkStopResult] = await CustomerSubscriptionModel.update({
                        status: false,
                        updated_by: socket.user.id,
                        updated_on: Sequelize.literal("CURRENT_TIMESTAMP")
                    }, {
                        where: {
                            id: subscriptionIds,
                            user_id: customerId
                        }, transaction
                    })
                    if (!bulkStopResult) {
                        throw new Error("error while stopping subscriptions in bulk")
                    }
                    // insert all records in update table
                    const updateTableResult = await CustomerSubscriptionsUpdateModel.bulkCreate(dataForUpdate, transaction);
                    // if any error while inserting records 
                    if (!updateTableResult) {
                        throw new Error("error while inserting records in update table")
                    }
                    // commit transaction
                    await transaction.commit();
                    socket.emit(currentRoute, {
                        success: true,
                        message: `${subscriptionIds?.length} Subscriptions stopped successfully`,
                    })
                } catch (error) {
                    console.error("Error =>", error)
                    await transaction.rollback();
                    return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute, error) })
                }
            }
            //if this is an single subscription to be stopped 
            const { id: subscriptionId } = await idSchema.validate({ id: data?.subscriptions ?? 0 });
            let isSubscriptionExists = await CustomerSubscriptionModel.findOne({
                where: {
                    id: subscriptionId,
                    user_id: customerId,
                }
            });
            if (!isSubscriptionExists) {
                return socket.emit(currentRoute, {
                    success: false,
                    message: "Subscription not found",
                });
            }
            // get subscription details form subscription view
            const subscriptionDetails = await CustomerSubscriptionViewModel.findOne({
                where: {
                    id: subscriptionId
                }
            })
            if (!subscriptionDetails) {
                return socket.emit(currentRoute, { success: false, message: "Subscription not found ", currentRoute })
            }
            const { weight, product_name, unit_name } = jsonFormator(subscriptionDetails);
            isSubscriptionExists = jsonFormator(isSubscriptionExists);
            if (!isSubscriptionExists.status) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Subscritption is already stopped !", currentRoute) })
            }
            const transaction = await sequelize.transaction();
            try {
                const [stopDetails] = await CustomerSubscriptionModel.update({
                    status: false,
                    updated_by: socket.user.id,
                    updated_on: Sequelize.literal("CURRENT_TIMESTAMP")
                }, {
                    where: {
                        id: subscriptionId
                    },
                    transaction
                })
                if (!stopDetails) {
                    throw new Error("error while stopping subscription ")
                }
                // update the current data in update table
                const refId = isSubscriptionExists.id;
                delete isSubscriptionExists.id;
                const updateTableResult = await CustomerSubscriptionsUpdateModel.create({
                    ...isSubscriptionExists,
                    ref_table_id: refId,
                    status: false,
                    created_on: sequelize.literal("CURRENT_TIMESTAMP"),
                    created_by: socket.user.id,
                    updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                    activity: "Subscription Stop"
                }, { transaction })
                if (!updateTableResult) {
                    throw new Error("error while inserting in update table");
                }
                await transaction.commit();
                socket.emit(currentRoute, {
                    success: true,
                    message: `Subscription for '${weight} ${unit_name} of ${product_name} ' is stoped successfully`,
                })
            } catch (error) {
                console.error("Error =>", error)
                await transaction.rollback();
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute, error) })
            }
        }
        catch (error) {
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
    // stop all subscriptions for a perticualr user 
    async stopAllSubscriptionsOfAUser(data, socket, io, currentRoute) {
        try {
            // if logged in user is disteribution center owner 
            const isDistCenterLogggedIn = (socket.user.role_id === 12 && socket.user.department_id == 6) ? true : false;
            const { id: customerId } = await idSchema.validate({ id: isDistCenterLogggedIn ? data.id : customer_id })
            console.log("customer id :", customerId)
            const { customer_id } = socket.user;
            // if distribution center is logged in the verify that a valid customer is selected
            if (isDistCenterLogggedIn) {
                const isValidCustomer = await UserModel.findOne({
                    where: {
                        id: customerId,
                        dist_center_id: socket.user.distribution_center_id,
                    }
                })
                // if customer is not belogs to current distribution center
                if (!isValidCustomer) {
                    return socket.emit(currentRoute, {
                        ...apiResponse
                            .error(false, "Invalid customer selected ", currentRoute)
                    }
                    )
                }
            }
            // get all active subscriptions of the user
            let allActiveSubscriptions = await CustomerSubscriptionModel.findAll({
                where: {
                    user_id: customerId,
                    distribution_center_id: socket?.user?.distribution_center_id,
                    status: true
                }
            })
            if (!allActiveSubscriptions) {
                return socket.emit(currentRoute, {
                    success: false,
                    message: "no subscriptions",
                });
            }
            // if no active subscription
            if (allActiveSubscriptions.length === 0) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "No active ,subscription found") })
            }
            allActiveSubscriptions = jsonFormator(allActiveSubscriptions);
            console.log("all active subscriptions =>", allActiveSubscriptions.length)
            // parse all active subscriptions to update in update table
            const subscriptionsStopData = allActiveSubscriptions.map((subscription) => {
                const refId = subscription.id;
                delete subscription.id;
                return {
                    ...subscription,
                    status: false,
                    ref_table_id: refId,
                    created_on: sequelize.literal("CURRENT_TIMESTAMP"),
                    created_by: socket.user.id,
                    updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                    activity: "Stop All Subscriptions"
                }
            })
            const transaction = await sequelize.transaction();
            try {
                const [subscriptionStopResult] = await CustomerSubscriptionModel.update({
                    status: false,
                    updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                    updated_by: socket.user.id
                }, {
                    where: {
                        user_id: customerId,
                        status: true
                    }, transaction
                })
                console.log("subscriptionStopResult =>", subscriptionStopResult)
                if (!subscriptionStopResult) {
                    throw new Error("error while stopping all subscriptions ")
                }
                console.log({
                    active: allActiveSubscriptions.length,
                    updated: subscriptionStopResult
                })
                // insert stop subscription data in update table (Customer_Subscription_Update)
                const updateResult = await CustomerSubscriptionsUpdateModel.bulkCreate(subscriptionsStopData, { transaction })
                if (!updateResult) {
                    throw new Error("error while inserting in update table")
                }
                await transaction.commit();
                socket.emit(currentRoute, {
                    success: true,
                    message: `all subscriptions stopped successfully !!`,
                })
            } catch (error) {
                console.error("Error =>", error)
                await transaction.rollback();
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute, error) })
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
    }
    ,
    // view subscriptions
    // view all subscriptions by user_id
    async viewSubscriptions(data, socket, io, currentRoute) {
        try {
            console.log(data)
            // if logged in user is distribution center then customer id will be provided 
            const isDistCenterLogggedIn = (socket.user.department_id == 6 && socket.user.role_id === 12) ? true : false;
            let customerId = 0
            if (isDistCenterLogggedIn) {
                let { id } = await idSchema.validate(data)
                customerId = id;
            }
            const subscriptions = await CustomerSubscriptionViewModel.findAll({
                where: {
                    userId: isDistCenterLogggedIn ? customerId : socket.user.id,
                    distribution_center_id: socket?.user?.distribution_center_id
                }
            })
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "Subscriptions fetched successfully", currentRoute, subscriptions),
            });
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
            console.error("Error =>", error)
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    // subscription by subscription id 
    async viewSubscriptionById(data, socket, io, currentRoute) {
        try {
            const { id } = await idSchema.validate(data);
            let subscriptionDetails = await CustomerSubscriptionModel.findOne({
                attributes: {
                    exclude: ["created_on", "updated_on", "created_by", "updated_by"]
                },
                where: {
                    id
                }
            });
            if (!subscriptionDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Subscription not found", currentRoute, []),
                });
            }
            subscriptionDetails = jsonFormator(subscriptionDetails);
            socket.emit(currentRoute, { ...apiResponse.success(true, "subscription data fetched successfully ", subscriptionDetails) })
        }
        catch (error) {
            console.error("Error =>", error)
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
    // to change one day quantity for a subscription 
    async changeOneDayQuantity(data, socket, io, currentRoute) {
        try {
            // extract current customer detals
            const { customer_id } = socket.user;
            const isDistCenterLoggedIn = (socket.user.department_id == 6 && socket.user.role_id === 12) ? true : false;
            const schema = Yup.object({
                customerId: Yup.number().min(2, customMessage.badReq).required(customMessage.badReq),
                subscriptionId: Yup.number().typeError("please select subscription ").required("subscription is not selected"),
                oneDayQuantity: Yup.number().min(1, "please enter valid quantity").typeError("please enter valid quantity").required()
            })
            const { customerId, subscriptionId, oneDayQuantity } = await schema.validate({ ...data, customerId: isDistCenterLoggedIn ? data.customerId : customer_id });
            // check wether subscription is active 
            let isSubscriptionExists = await CustomerSubscriptionModel.findOne({
                where: {
                    id: subscriptionId,
                    user_id: customerId,
                    distribution_center_id: socket?.user?.distribution_center_id,
                    status: true
                }
            });
            // if subscription not found
            if (!isSubscriptionExists) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "subscription not found !!") })
            }
            isSubscriptionExists = jsonFormator(isSubscriptionExists);
            // if subscription is stoped 
            if (!isSubscriptionExists.status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "subscription is paused please activate to make any modification")
                })
            }
            // if quantity is same as previous quanity
            console.log({
                prev: isSubscriptionExists.quantity, current: oneDayQuantity
            });
            // check of new quantity and prvious quantity is name or one_day_change_quantity is same as new quantity
            if (isSubscriptionExists.quantity === oneDayQuantity || isSubscriptionExists.one_day_change_quantity === oneDayQuantity) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "your request can't be processed because quantity is same ")
                })
            }
            const transaction = await sequelize.transaction();
            // change subscription's one day quantity
            try {
                const [changeResult] = await CustomerSubscriptionModel.update({
                    one_day_change_quantity: oneDayQuantity
                }, {
                    where: {
                        id: subscriptionId,
                        user_id: customerId
                    }, transaction
                })
                console.log("changeResult =>", changeResult)
                if (!changeResult) {
                    throw new Error("Error while updating one day quantity")
                }
                const refId = isSubscriptionExists.id;
                delete isSubscriptionExists.id;
                // inset data in subscription update table 
                const updateTableResult = await CustomerSubscriptionsUpdateModel.create({
                    ...isSubscriptionExists,
                    activity: "One Day Quantity Change",
                    ref_table_id: refId,
                    created_on: sequelize.literal("CURRENT_TIMESTAMP"),
                    created_by: socket.user.id,
                    updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                }, transaction)
                if (!updateTableResult) {
                    throw new Error("Error while inserting data in subscription update table")
                }
                await transaction.commit();
                socket.emit(currentRoute, {
                    success: true,
                    message: `one day quantity updated successfully!!`,
                })
            } catch (error) {
                console.error("Error =>", error)
                await transaction.rollback();
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute, error) })
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
    //all subscriptions by distiribution center id
    async viewAllSubscriptionsByDistributionCenter(data, socket, io, currentRoute) {
        try {
            console.log(socket.user)
            const subscriptions = await CustomerSubscriptionViewModel.findAll({
                where: {
                    distribution_center_id: socket.user.distribution_center_id
                }
            })
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "all subscriptions fetched successfully ", currentRoute, subscriptions)
            });
        } catch (error) {
            console.error("Error =>", error)
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    }
    , async reactivateSubscription(data, socket, io, currentRoute) {
        try {
            console.log("hitted ")
            // get detial of curret logged in customer
            const { customer_id: currentCustomer } = socket.user;
            // if reactivateAll flag is true then reactivate all stopped subscriptions  else reactivate subscriptions according to request
            const { reactivateAll = false, subscriptions, customerId: providedCustomerId } = data;
            // if logged in user is disteribution center owner 
            const isDistCenterLogggedIn = (socket.user.role_id === 12 && socket.user.department_id == 6) ? true : false;
            const custIdSchema = Yup.object({
                customerId: Yup.number().typeError("Please select a valid customer ").min(1, customMessage.badReq).required("please select customer")
            })
            // validate customer id
            const { customerId } = await custIdSchema.validate({ customerId: isDistCenterLogggedIn ? providedCustomerId : currentCustomer });
            // if distribution center is logged in the verify that a valid customer is selected
            if (isDistCenterLogggedIn) {
                const isValidCustomer = await UserModel.findOne({
                    where: {
                        id: customerId,
                        dist_center_id: socket.user.distribution_center_id,
                    }
                })
                // if customer is not belogs to current distribution center
                if (!isValidCustomer) {
                    return socket.emit(currentRoute, {
                        ...apiResponse
                            .error(false, "Invalid customer selected ", currentRoute)
                    }
                    )
                }
            }
            // if customer/ distribution center want to reactivate all stopped subscriptions 
            if (reactivateAll) {
                const transaction = await sequelize.transaction();
                try {
                    let allStopedSubscriptions = await CustomerSubscriptionModel.findAll({
                        where: {
                            user_id: customerId,
                            distribution_center_id: socket?.user?.distribution_center_id,
                            status: false
                        }
                    })
                    allStopedSubscriptions = jsonFormator(allStopedSubscriptions)
                    if (allStopedSubscriptions.length == 0) {
                        return socket.emit(currentRoute, {
                            success: false,
                            message: "No subscriptions to reactivate",
                        })
                    }
                    // formate data for update table 
                    const dataForUpdate = allStopedSubscriptions.map((subscription) => {
                        const refId = subscription.id;
                        delete subscription.id;
                        return {
                            ...subscription,
                            status: true,
                            ref_table_id: refId,
                            activity: "All Subscription Re-Activated",
                            created_on: sequelize.literal("CURRENT_TIMESTAMP"),
                            created_by: socket.user.id,
                            updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                        }
                    }
                    )
                    // reactivate all
                    const [reactivationResult] = await CustomerSubscriptionModel.update({
                        status: true,
                    }, {
                        where: {
                            user_id: customerId,
                            distribution_center_id: socket?.user?.distribution_center_id,
                            status: false
                        }, transaction
                    })
                    console.log({
                        stoped: allStopedSubscriptions.length,
                        reactivated: reactivationResult
                    })
                    // check whether all stped subscriptions areactivated or not 
                    if (allStopedSubscriptions.length !== reactivationResult) {
                        throw new Error("error while reactivativation of all  subscriptions")
                    }
                    // insert data in subscription update table 
                    const updateTableResult = await CustomerSubscriptionsUpdateModel.bulkCreate(dataForUpdate, { transaction })
                    if (!updateTableResult) {
                        throw new Error("error while inserting data in subscription update table")
                    }
                    await transaction.commit();
                    return socket.emit(currentRoute, { ...apiResponse.success(true, `All (${allStopedSubscriptions.length}) subscriptions Re-activated successfully`, currentRoute) })
                } catch (error) {
                    console.error("Error =>", error)
                    await transaction.rollback();
                    return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute, error) })
                }
            }
            // check whether the subscriptions are multiple \\
            if (Array.isArray(data.subscriptions)) {
                // start transaction 
                const transaction = await sequelize.transaction();
                try {
                    // validate all subscriptions 
                    // formate data for bulk insert in update table
                    // stop all subscriptions in customer
                    // extract all subscription data and formate that
                    const subscriptionIds = await Promise.all(subscriptions.map(async (reqtedId) => {
                        // we assums that if customerid is not provide then the logged in user is customer itself
                        console.log(reqtedId)
                        const { id } = await idSchema.validate({ id: reqtedId });
                        return id;
                        // subscriptionIds.push(await id)
                    }))
                    console.log("subscription will be reactivated  ", { subsIds: subscriptionIds.length, customerId })
                    // find all active subscriptions according to provided id's 
                    let stopedSubscriptions = await CustomerSubscriptionModel.findAll({
                        where: {
                            id: subscriptionIds,
                            user_id: customerId,
                            distribution_center_id: socket?.user?.distribution_center_id,
                            status: false
                        }
                    })
                    stopedSubscriptions = jsonFormator(stopedSubscriptions);
                    console.table(stopedSubscriptions)
                    console.log("active subscriptions: ", stopedSubscriptions.length, "requested =>", subscriptionIds.lenght)
                    // if provided subscription are not equal to the active subscriptions 
                    if (subscriptionIds.length !== stopedSubscriptions.length) {
                        return socket.emit(currentRoute, {
                            ...apiResponse.error(false, customMessage.cantPerform, currentRoute)
                        })
                    }
                    // formate stoped subscriptions data for update table
                    const dataForUpdate = stopedSubscriptions.map((sub) => {
                        const refId = sub.id;
                        delete sub.id;
                        return {
                            ...sub,
                            activity: "Multiple Subscription Re-activation",
                            ref_table_id: refId,
                            status: true,
                            created_on: sequelize.literal("CURRENT_TIMESTAMP"),
                            updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                            created_by: socket.user.id
                        }
                    })
                    // reactivate  subscriptions in bulk
                    const [bulkReactivateResult] = await CustomerSubscriptionModel.update({
                        status: true,
                        updated_by: socket.user.id,
                        updated_on: Sequelize.literal("CURRENT_TIMESTAMP")
                    }, {
                        where: {
                            id: subscriptionIds,
                            user_id: customerId,
                            distribution_center_id: socket?.user?.distribution_center_id
                        }, transaction
                    })
                    if (!bulkReactivateResult) {
                        throw new Error("error while activating subscriptions in bulk")
                    }
                    // insert all records in update table
                    const updateTableResult = await CustomerSubscriptionsUpdateModel.bulkCreate(dataForUpdate, transaction);
                    // if any error while inserting records 
                    if (!updateTableResult) {
                        throw new Error("error while inserting records in update table")
                    }
                    // commit transaction
                    await transaction.commit();
                    return socket.emit(currentRoute, {
                        success: true,
                        message: `(${subscriptionIds?.length}) Subscriptions Re-activated  successfully`,
                    })
                } catch (error) {
                    console.error("Error =>", error)
                    await transaction.rollback();
                    return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute, error) })
                }
            }
            //if  single subscription is to be reactivated 
            const { id: subscriptionId } = await idSchema.validate({ id: data?.subscriptions ?? 0 });
            // check wether subscription crossponding to provided data is exists
            let isSubscriptionExists = await CustomerSubscriptionModel.findOne({
                where: {
                    id: subscriptionId,
                    user_id: customerId,
                    distribution_center_id: socket?.user?.distribution_center_id
                }
            });
            if (!isSubscriptionExists) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "subscription not found !") });
            }
            isSubscriptionExists = jsonFormator(isSubscriptionExists)
            // if subscription is already active
            if (isSubscriptionExists.status) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "subscription already active", currentRoute) });
            }
            // get subscription details form subscription view
            const subscriptionDetails = await CustomerSubscriptionViewModel.findOne({
                where: {
                    id: subscriptionId
                }
            })
            if (!subscriptionDetails) {
                return socket.emit(currentRoute, { success: false, message: "Subscription not found ", currentRoute })
            }
            const { weight, product_name, unit_name } = jsonFormator(subscriptionDetails);
            const transaction = await sequelize.transaction();
            try {
                // reactivate subscriptions
                const [reactivationDetails] = await CustomerSubscriptionModel.update({
                    status: true,
                    updated_by: socket.user.id,
                    updated_on: Sequelize.literal("CURRENT_TIMESTAMP")
                }, {
                    where: {
                        id: subscriptionId
                    },
                    transaction
                })
                if (!reactivationDetails) {
                    throw new Error("error while reactivate subscription ")
                }
                // update the current data in update table
                const refId = isSubscriptionExists.id;
                delete isSubscriptionExists.id;
                const updateTableResult = await CustomerSubscriptionsUpdateModel.create({
                    ...isSubscriptionExists,
                    ref_table_id: refId,
                    status: true,
                    created_on: sequelize.literal("CURRENT_TIMESTAMP"),
                    created_by: socket.user.id,
                    updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                    activity: "Subscription Reactivate"
                }, { transaction })
                if (!updateTableResult) {
                    throw new Error("error while inserting in update table");
                }
                await transaction.commit();
                socket.emit(currentRoute, {
                    success: true,
                    message: `Subscription for '${weight} ${unit_name} of ${product_name} ' is Re-activated successfully`,
                })
            } catch (error) {
                console.error("Error =>", error)
                await transaction.rollback();
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute, error) })
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
    }
}
async function updateSubscriptionHandler(data, customerId, isDistCenter, transaction, socket, currentRoute) {
    const { id, deliveryBoyId, userPrice, allDay, alternateDay, packingSizeId, specificDay, productId, quantity, regularDay, shift, sunday, monday, tuesday, wednesday, thursday, friday, saturday } = data;
    // check wether the subscriptionis already exists or not
    let isSubscriptionExists = await CustomerSubscriptionModel.findByPk(id);
    if (!isSubscriptionExists) {
        return socket.emit(currentRoute, {
            ...apiResponse.error(false, "Subscription not found"),
        });
    }
    // existing delivery boy which is assigned for this subscription
    const { delivery_boy_id: currentDeliveryBoy } = jsonFormator(isSubscriptionExists)
    // check wether valid product is seleced
    let productDetails = await ProductModel.findOne({
        where: {
            id: productId,
            status: true,
            ms_product_type_id: 3
        }
    })
    // if product details is not found
    if (!productDetails) {
        return socket.emit(currentRoute, {
            ...apiResponse.error(false, "Invalid product selected, please select a valid product")
        })
    }
    productDetails = jsonFormator(productDetails)
    // if logged in user is customer than it is required to select valid product's packing size 
    if (socket?.user?.role_id === 4) {
        let packingSizeDetails = await MasterPackingSizeModel.findOne({
            where: {
                product_id: productId,
                id: packingSizeId
            }
        })
        if (!packingSizeDetails) {
            return socket.emit(currentRoute, {
                success: false,
                message: `Please select valid packing size for ${productDetails?.product_name}`
            })
        }
    }
    // id logged in user is distribution center then he can change the delivery boy for the subscription , in other case the delivery boy will be keep same as privious
    try {
        const [updateDetails] = await CustomerSubscriptionModel.update({
            delivery_boy_id: isDistCenter ? deliveryBoyId : currentDeliveryBoy ? currentDeliveryBoy : null,
            product_id: productId,
            quantity: quantity,
            user_price: userPrice,
            all_day: allDay,
            alternate_day: alternateDay,
            specific_day: specificDay,
            regular_day: regularDay,
            master_packing_size_id: packingSizeId ?? 0,
            shift,
            sunday,
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday,
            updated_by: socket.user.id,
            updated_on: Sequelize.literal("CURRENT_TIMESTAMP")
        }, {
            where: {
                id: id
            },
            transaction
        })
        if (!updateDetails) {
            throw new Error("error while updating subscription ")
        }
        // // refetch updated data for update table
        let updatedData = await CustomerSubscriptionModel.findByPk(id, { transaction });
        console.log("updated data =>", updatedData)
        if (!updatedData) {
            throw new Error("error while fetching updated data")
        }
        updatedData = jsonFormator(updatedData);
        const refId = updatedData.id;
        delete updatedData.id;
        return {
            ...updatedData,
            activity: "Update",
            ref_table_id: refId,
            created_on: sequelize.literal("CURRENT_TIMESTAMP"),
            created_by: socket.user.id
        }
    } catch (error) {
        console.error("Error =>", error)
        await transaction.rollback();
        return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute, error) })
    }
}
export default customerSubscriptionControllers

