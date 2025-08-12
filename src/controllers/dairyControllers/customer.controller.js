import { CustomerSubscriptionModel } from "../../model/dairyModels/customerSubscriptions.model.js";
import { apiResponse } from "../../utility/response.util.js";
import Yup from "yup"
import { CustomerDeliveryBoyMappingModel } from "../../model/dairyModels/customerDelivBoyMapping.model.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { registerSchema } from "../../yup-schemas/registUser.schema.js";
import { UserModel } from "../../model/user.model.js";
import { sequelize } from "../../config/dbConfig.js";
import { customMessage } from "../../utility/messages.util.js";
import { MasterDistributionCentersModel } from "../../model/masterDistributionCenter.model.js";
import { CustomerSubscriptionsUpdateModel } from "../../model/dairyModels/updateCustomerSubscription.model.js";
import { CustomerDeliveryBoyMappingUpdateModel } from "../../model/dairyModels/customerDeliveryBoyMappingUpdate.model.js";
import { UserDetailView } from "../../model/views/userView.model.js";
const customerControllers = {
    async customerRegistration(data, socket, io, currentRoute) {
        console.table(data)
        try {
            console.log("socket.user =<>", socket.user);
            console.table(socket.user)
            let distributionId = 0;
            let { id = 0, role_id, department_id, distribution_center_id } = socket.user ? socket.user : { id: 0, role_id: 0, department_id: 0 };
            // if logged-in user is distribution center 
            if (department_id === 6 && role_id === 12) {
                distributionId = distribution_center_id;
            } // user is registering by self 
            else {
                distributionId = data.distCenterId;
            }
            const customerNewFields = Yup.object({
                deliveryBoyId: Yup.number().typeError("Please select delivery boy").default(0),
                distCenterId: Yup.number().typeError("Please select a valid distribution center").required("distribution center is not selected")
            })
            const customerSchema = registerSchema.concat(customerNewFields);
            const validationResult = await customerSchema.validate({ ...data, distCenterId: distributionId }, { striptUnknown: true });
            // console.table(validationResult)
            const { deliveryBoyId, distCenterId } = validationResult;
            console.log("validation result =>", validationResult)
            // if distribution center owner is creating user and delivery boy is not selected 
            if (id && deliveryBoyId == 0) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "please select delivery boy") })
            }
            // if delivery is selected
            if (id && deliveryBoyId !== 0) {
                // check is selected delivery boy exists and belongs to current distribution center 
                const isValidDeliveryBoy = await UserModel.findOne({
                    where: {
                        id: deliveryBoyId,
                        dist_center_id: distCenterId,
                        role_id: 7,
                        department_id: 6,
                        created_by: id,
                        status: 1//delivery boy shuld be active
                    },
                })
                console.log("delivery boy details =>", isValidDeliveryBoy)
                if (!isValidDeliveryBoy) {
                    return socket.emit(currentRoute, {
                        ...apiResponse.error(false, "Please select a valid delivery boy", currentRoute),
                    });
                }
            }
            // check wether seleceted distribution center is exists or not 
            const isDistCenterExists = await MasterDistributionCentersModel.findByPk(distCenterId)
            if (!isDistCenterExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Please select a valid distribution center", currentRoute),
                });
            }
            const transaction = await sequelize.transaction();
            try {
                // find if user aleady registered
                let isExistingUser = await UserModel.findOne({
                    where: {
                        mobile: validationResult.mobile,
                    },
                });
                isExistingUser = jsonFormator(isExistingUser);
                // console.log(
                //     "user info =.........................................>>>>>",
                //     isExistingUser
                // );
                //   if user exists
                if (isExistingUser) {
                    return socket.emit(currentRoute, {
                        ...apiResponse.error(false, "user already registered", currentRoute),
                    });
                }
                // save user info in database
                let registerResult = await UserModel.create({
                    ...validationResult,
                    dist_center_id: distCenterId,
                    socket_id: false,
                    created_by: id
                }, { transaction });
                registerResult = jsonFormator(registerResult);
                // if user registering by self 
                if (!id) {
                    // update created by 
                    const [updateCreatedBy] = await UserModel.update({
                        created_by: registerResult.id
                    }, {
                        where: {
                            id: registerResult.id
                        },
                        transaction
                    })
                    if (!updateCreatedBy) {
                        throw new Error("error while updating created by")
                    }
                }
                console.log("registration result =>", registerResult)
                // assign delivery boy and create a dummy subscription  if user is created by distribution center
                if (id) {
                    // create a dummy subscription 
                    let subscriptionResult = await CustomerSubscriptionModel.create({
                        user_id: registerResult.id,
                        product_id: 49,
                        quantity: 0.00,
                        all_day: false,
                        alternate_day: false,
                        specific_day: false,
                        regular_day: false,
                        shift: 1,
                        sunday: false,
                        monday: false,
                        tuesday: false,
                        wednesday: false,
                        thursday: false,
                        friday: false,
                        saturday: false,
                        created_by: id,//id of distribution center owner 
                        distribution_center_id: distributionId,
                        delivery_boy_id: deliveryBoyId,
                        creted_by: id
                    }, { transaction })
                    if (!subscriptionResult) {
                        throw new Error("error while creating subscription")
                    }
                    subscriptionResult = jsonFormator(subscriptionResult);
                    console.log("Subscription Result =>", subscriptionResult)
                    const subscriptionId = subscriptionResult.id;
                    delete subscriptionResult.id;
                    // insert subscription data in subscription update table
                    let subscriptionUpdate = await CustomerSubscriptionsUpdateModel.create({
                        ...subscriptionResult,
                        ref_table_id: subscriptionId,
                        activity: "New"
                    }, { transaction })
                    if (!subscriptionUpdate) {
                        throw new Error("error while creating subscription update table")
                    }
                    subscriptionUpdate = jsonFormator(subscriptionUpdate)
                    console.log("subscriptionUpdate table result =>", subscriptionUpdate)
                    // assign delivery boy
                    let assignDeliveryBoy = await CustomerDeliveryBoyMappingModel.create({
                        delivery_boy_id: deliveryBoyId,
                        customer_id: registerResult.id,
                        customer_subscriptions_id: subscriptionId,
                        created_by: id,
                    }, { transaction });
                    if (!assignDeliveryBoy) {
                        throw new Error("error while assigning delivery boy");
                    }
                    assignDeliveryBoy = jsonFormator(assignDeliveryBoy)
                    // insert data in customer delivery update table
                    const assignId = assignDeliveryBoy.id;
                    delete assignDeliveryBoy.id;
                    let updateDeliveryMapping = await CustomerDeliveryBoyMappingUpdateModel.create({
                        ...assignDeliveryBoy,
                        ref_table_id: assignId, activity: "New", created_by: id
                    }, { transaction })
                    if (!updateDeliveryMapping) {
                        throw new Error("error while creating delivery boy mapping update table")
                    }
                    updateDeliveryMapping = jsonFormator
                }
                //   if any error while createting user
                if (!registerResult?.id) {
                    throw new Error("error while creating user ");
                }
                await transaction.commit();
                console.log("registerResult", registerResult);
                socket.emit(currentRoute, {
                    ...apiResponse.success(
                        "true",
                        "user created successfully",
                        currentRoute
                    ),
                });
            } catch (error) {
                console.error("ERROR =>", error);
                await transaction.rollback();
                socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute, error) })
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
    // constrollers list
    //1. view subscriptions
    // 2. order
    // 3. cancel subscription
    // 4. view orders
    // 5. view order details
    // 6. view subscription details
    // 7. update subscription
    // 8. update order
    // 9. cancel order
    // 10. view customer details
    //
    // Get Customer according to dist center id
    async customerGetByDistId(data, socket, io, currentRoute) {
        try {
            let customerList = await UserDetailView.findAll({
                where: {
                    dist_center_id: socket.user.distribution_center_id,
                    role_id: 4,
                    status: true
                },
                order: [["created_on", "DESC"]]
            });
            if (!customerList || customerList.length <= 0) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Data " + customMessage.notFound, currentRoute) })
            }
            customerList = jsonFormator(customerList);
            return socket.emit(currentRoute, { ...apiResponse.success(true, "Data " + customMessage.fetched, currentRoute, customerList) });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async deactivatedcustomerGetByDistId(data, socket, io, currentRoute) {
        try {
            let customerList = await UserDetailView.findAll({
                where: {
                    dist_center_id: socket.user.distribution_center_id,
                    role_id: 4,
                    status: false
                },
                order: [["created_on", "DESC"]]
            });
            if (!customerList || customerList.length <= 0) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Data " + customMessage.notFound, currentRoute) })
            }
            customerList = jsonFormator(customerList);
            return socket.emit(currentRoute, { ...apiResponse.success(true, "Data " + customMessage.fetched, currentRoute, customerList) });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    // 
    // to replace an existing delivery to another
    async replaceDeliveryBoy(data, socket, io, currentRoute) {
        try {
            console.table(socket.user)
            console.log(data)
            const replaceSchema = Yup.object({
                currentBoy: Yup.number().min(2, "Please selelect a valid current delivery boy").typeError("Please selelect a valid current delivery boy").required("current delivery boy is required "),
                newBoy: Yup.number().min(2, "Please selelect a valid new delivery boy").typeError("Please selelect a valid new delivery boy").required("new delivery boy is required ")
            })
            const { currentBoy, newBoy } = await replaceSchema.validate(data, { striptUnknown: true });
            // check wether the both delivery boys are sama
            if (currentBoy == newBoy) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Current and new delivery boy should not be same", currentRoute)
                })
            }
            //find out details of both deliver boys
            const currentDBoyData = jsonFormator(await UserModel.findOne({
                where: {
                    id: currentBoy,
                    dist_center_id: socket.user.distribution_center_id,
                }
            }));
            if (!currentDBoyData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, `current delivery boy not found `)
                })
            }
            // if current delivery boy is disabled
            if (!currentDBoyData.status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, `current delivery boy ${currentDBoyData.full_name} is disabled `)
                })
            }
            // find out data of new delivery boy
            const newDBoyData = jsonFormator(await UserModel.findByPk(newBoy));
            if (!newDBoyData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, `New delivery boy not found `)
                })
            }
            // if new delivery boy is disabled
            if (!newDBoyData.status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, `New delivery boy ${newDBoyData.full_name} is disabled `)
                })
            }
            // check wether the delivery boy is changed for multiple customers 
            const isMultipleCustomers = Array.isArray(data.customers);
            console.log("customrs =>", data.customers)
            // check wether all selected customers are belogs to current distribution center
            const customersDetail = jsonFormator(await UserModel.findAll({
                where: {
                    id: data.customers,
                    dist_center_id: socket.user.distribution_center_id
                }
            }))
            console.log("customers details =>>>", customersDetail)
            console.log({
                cd: customersDetail.length,
                acC: data.customers.length
            })
            if (customersDetail.length != data.customers.length) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Invalid customer selected ", currentRoute)
                })
            }
            const transaction = await sequelize.transaction();
            try {
                console.log("inside transaction ");
                // find out details of all customers where current delivery boy is set as default delivery boy
                const mappindData = jsonFormator(await CustomerDeliveryBoyMappingModel.findAll({
                    where: {
                        delivery_boy_id: currentBoy,
                        customer_id: data.customers,
                        status: true
                    },
                    transaction
                }))
                console.log("mapping data fetched ");
                if (mappindData.length == 0) {
                    return socket.emit(currentRoute, { ...apiResponse.error(false, ` customers not asssigned to the current delivery boy '${currentDBoyData.full_name}'`) })
                }
                // parse id's of all subscriptions 
                const mappingIds = mappindData.map((sub) => sub.id);// like [1,10,5]
                if (mappingIds?.length == 0) {
                    return socket.emit(currentRoute, { ...apiResponse.error(false, `customers not found for  delivery boy '${currentDBoyData.full_name}'`) })
                }
                // replace delivery boy in customer_delivery_boy mapping table
                const [replaceResult] = await CustomerDeliveryBoyMappingModel.update({
                    delivery_boy_id: newBoy,
                    updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                    updated_by: socket.user.id,
                }, {
                    where: {
                        id: mappingIds,
                    }, transaction
                })
                if (replaceResult !== mappingIds.length) {
                    throw new Error(`replaced result ${replaceResult} is not equal to ${mappingIds.length}`)
                }
                // to fomate data for customer_subscription_update table
                const deliveryBoyMappingUpdateData = mappindData.map((curretSub) => {
                    const refId = curretSub.id;
                    delete curretSub.id;
                    return {
                        ...curretSub,
                        ref_table_id: refId,
                        delivery_boy_id: newBoy,
                        activity: "update",
                        description: `replaced delivery boy from ${currentBoy} to ${newBoy}`,
                        updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                        created_by: socket.user.id
                    }
                })
                // insert the data in update table of customer delivery boy mapping
                const custDelBoyMapingUpdateResult = jsonFormator(
                    await CustomerDeliveryBoyMappingUpdateModel.bulkCreate(deliveryBoyMappingUpdateData, {
                        transaction
                    })
                )
                if (custDelBoyMapingUpdateResult.length !== mappingIds.length) {
                    throw new Error(`custDelBoyMapingUpdateResult ${custDelBoyMapingUpdateResult.length} is not equal to ${mappingIds.length}`)
                }
                // update delivery boy in customer subscriptions
                // get all subscriptions of all provided customers where current delivery boy is providing delivery services
                const allSubscriptions = jsonFormator(
                    await CustomerSubscriptionModel.findAll({
                        where: {
                            user_id: data.customers,
                            distribution_center_id: socket.user.distribution_center_id
                        },
                        transaction
                    })
                )
                // parse  ids of all subscriptions 
                const allSubscriptionIds = allSubscriptions.map((sub) => sub.id);
                // replace currrent delivery boy with new delivery boy
                const [replaceInSubscriptions] = await CustomerSubscriptionModel.update({
                    delivery_boy_id: newBoy,
                    updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                    updated_by: socket.user.id,
                }, {
                    where: {
                        id: allSubscriptionIds,
                    }, transaction
                })
                if (replaceInSubscriptions !== allSubscriptionIds?.length) {
                    throw new Error(`replaceInSubscriptions ${replaceInSubscriptions} is not equal to ${allSubscriptionIds?.length}`)
                }
                // formate data for customer_subscription_update table
                const subscriptionUpdateData = allSubscriptions.map((curretSub) => {
                    const refId = curretSub.id;
                    delete curretSub.id;
                    return {
                        ...curretSub,
                        delivery_boy_id: newBoy,
                        ref_table_id: refId,
                        activity: "update",
                        description: `replaced delivery boy from ${currentBoy} to ${newBoy}`,
                        updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                        created_by: socket.user.id
                    }
                })
                // insert the data in update table of customer subscriptions
                const custSubscriptionUpdateResult = jsonFormator(
                    await CustomerSubscriptionsUpdateModel.bulkCreate(subscriptionUpdateData, {
                        transaction
                    })
                )
                if (custSubscriptionUpdateResult?.length !== allSubscriptionIds?.length) {
                    throw new Error(`custSubscriptionUpdateResult ${custSubscriptionUpdateResult?.length} is not equal to ${allSubscriptionIds?.length}`)
                }
                await transaction.commit()
                socket.emit(currentRoute, { ...apiResponse.success(true, `'${currentDBoyData.full_name}' is replaced with '${newDBoyData.full_name}' for ${isMultipleCustomers ? mappingIds.length : 1} customer and ${allSubscriptionIds?.length} subscriptions  `) })
                console.log(`'${currentDBoyData.full_name}' is replaced with '${newDBoyData.full_name}' for ${isMultipleCustomers ? mappingIds.length : 1} customer and ${allSubscriptionIds?.length} subscriptions  `);
                // await transaction.rollback();
            } catch (error) {
                console.error("Error =>", error);
                await transaction.rollback();
                socket.emit(currentRoute, customMessage.wentWrong, currentRoute);
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
export default customerControllers;

