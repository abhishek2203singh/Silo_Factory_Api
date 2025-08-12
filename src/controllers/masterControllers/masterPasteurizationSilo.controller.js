import Yup from "yup";
import { MasterPasteurizationSilosModel } from "../../model/masterPasteurizationSilo.model.js";
import { apiResponse } from "../../utility/response.util.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { customMessage } from "../../utility/messages.util.js";
import { changeDetector } from "../../utility/changeDetector.util.js";
const masterPasteurizationSiloControllers = {
    async getAllSilos(data, socket, io, currentRoute) {
        try {
            let allSilos = await MasterPasteurizationSilosModel.findAll({
                attributes: {
                    exclude: [
                        "created_by",
                        "updated_by",
                        "updated_on",
                        "is_deletable",
                    ],
                },
                where: {
                    status: true,
                },
                order: [[["created_on", "DESC"]]],
            });
            if (!allSilos) {
                socket.emit("error", {
                    ...apiResponse.error(false, "Silos not found !", currentRoute),
                });
            }
            allSilos = jsonFormator(allSilos);
            // add new field empty_space
            allSilos = allSilos.map((silo) => {
                return {
                    ...silo,
                    empty_space: silo.capacity - silo.total_available_milk,
                }
            })
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "silos fetched successfully",
                    currentRoute,
                    allSilos
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    // create new silo
    async createSilo(data, socket, io, currentRoute) {
        try {
            const siloSchema = Yup.object({
                siloName: Yup.string("invalid  silo name").required(
                    " silo  name is required"
                ),
                capacity: Yup.number("silo capacity must be a number !")
                    .typeError("silo capacity must be a number")
                    .min(1, "Silo capacity must be greater than 1")
                    .max(
                        "9223372036854775807",
                        "silo capacity cannot be greater than 9223372036854775807"
                    )
                    .required("silo capacity is required"),
                availableMilk: Yup.number("Available milk must be number")
                    .min(0, "Available Milk can't be nagetive !")
                    .default(0)
                    .test(
                        "capacity-grater-than-available-milk",
                        "avalible-milk cannot be greater than silos capacity",
                        function (value) {
                            return value < this.parent.capacity;
                        }
                    ),
                // priorityLevel: Yup.string()
                //   .oneOf(
                //     ["permanent", "temporary"],
                //     "Please select silo priority level like , permanent or temporary"
                //   )
                //   .required("priority level is required !"),
                status: Yup.boolean("please select silo status").default(true),
            });
            const { siloName, capacity, availableMilk, priorityLevel, status } =
                await siloSchema.validate(data, {
                    abortEarly: true,
                    stripUnknown: true,
                });
            const isSiloExists = await MasterPasteurizationSilosModel.findOne({
                where: {
                    silo_name: siloName,
                },
            });
            console.log("is exists =>", isSiloExists);
            if (isSiloExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `silo '${siloName} already exists`,
                        currentRoute,
                        ""
                    ),
                });
            }
            let siloCreationResult = await MasterPasteurizationSilosModel.create({
                silo_name: siloName,
                capacity,
                total_available_milk: availableMilk,
                is_deletable: priorityLevel == "permanent" ? false : true,
                status,
                created_by: socket.user.id,
            });
            siloCreationResult = jsonFormator(siloCreationResult);
            // if any error while creating menu
            if (!siloCreationResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Error while creating silo",
                        currentRoute,
                        ""
                    ),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    `silo '${siloName} ' created successfully !`,
                    currentRoute
                ),
            });
            this.getAllSilos(data, socket, io, "ms-ps-silo:all");
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async updateSilo(data, socket, io, currentRoute) {
        try {
            const siloSchema = Yup.object({
                siloId: Yup.number()
                    .min(1, customMessage.badReq)
                    .required(customMessage.badReq),
                siloName: Yup.string().required(" silo  name is required"),
                capacity: Yup.number("silo capacity must be a number !")
                    .min(1, "Silo capacity must be greater than 1")
                    .required("silo capacity is required"),
                availableMilk: Yup.number("Available milk must be number")
                    .min(0, "Available Milk can't be nagetive !")
                    .default(0)
                    .test(
                        "capacity-grater-than-available-milk",
                        "avalible-milk cannot be greater than silos capacity",
                        function (value) {
                            return value < this.parent.capacity;
                        }
                    ),
                // priorityLevel: Yup.string()
                //   .oneOf(
                //     ["permanent", "temporary"],
                //     "Please select silo priority level like , permanent or temporary"
                //   )
                //   .required("priority level is required !"),
                status: Yup.boolean("please select silo status").default(true),
            });
            const {
                siloId,
                siloName,
                capacity,
                availableMilk,
                priorityLevel,
                status,
            } = await siloSchema.validate(data, {
                abortEarly: true,
                stripUnknown: true,
            });
            let siloToUpdate = await MasterPasteurizationSilosModel.findByPk(siloId, {
                attributes: {
                    exclude: [
                        "created_by",
                        "created_on",
                        "created_by",
                        "updated_by",
                        "updated_on",
                        "is_deletable",
                    ],
                },
            });
            console.log();
            if (!siloToUpdate) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, `silo  not found`, currentRoute, ""),
                });
            }
            const changes = {
                id: siloId,
                silo_name: siloName,
                total_available_milk: parseFloat(availableMilk).toFixed(2),
                status: Number(status),
                capacity: parseFloat(capacity).toFixed(2),
            };
            siloToUpdate = jsonFormator(siloToUpdate);
            const hasChanges = changeDetector(siloToUpdate, changes);
            if (!hasChanges) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.noChange, currentRoute),
                });
            }
            const [updateResult] = await MasterPasteurizationSilosModel.update(
                {
                    silo_name: siloName,
                    capacity,
                    total_available_milk: availableMilk,
                    is_deletable: priorityLevel == "permanent" ? false : true,
                    status,
                    updated_by: socket.user.id,
                },
                {
                    where: {
                        id: siloId,
                    },
                }
            );
            if (!updateResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `silo '${siloName}' not updated `,
                        currentRoute
                    ),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    `This Silo has been updated successfully `,
                    currentRoute
                ),
            });
            this.getAllSilos(data, socket, io, "ms-ps-silo:all");
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
    async deleteSilo(data, socket, io, currentRoute) {
        try {
            const { siloId } = data;
            if (!siloId || siloId < 1) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute, ""),
                });
            }
            let silosTobeDeleted = await MasterPasteurizationSilosModel.findOne({
                where: {
                    id: siloId,
                },
            });
            if (!silosTobeDeleted) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.notEx, currentRoute, ""),
                });
            }
            if (!silosTobeDeleted.status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `The silo  ' ${silosTobeDeleted.silo_name} ' is already inactive / deleted`,
                        currentRoute,
                        ""
                    ),
                });
            }
            silosTobeDeleted = jsonFormator(silosTobeDeleted);
            const [isDeleted] = await MasterPasteurizationSilosModel.update(
                {
                    status: false,
                },
                {
                    where: {
                        id: siloId,
                    },
                }
            );
            if (!isDeleted) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `Error while deleting silo`,
                        currentRoute,
                        ""
                    ),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    `silo '${silosTobeDeleted.silo_name}' deleted successfully`,
                    currentRoute
                ),
            });
            this.getAllSilos(data, socket, io, "ms-ps-silo:all");
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    // get silo by id
    async getSiloById(data, socket, io, currentRoute) {
        try {
            const { siloId } = data;
            if (!siloId || siloId < 1) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute, ""),
                });
            }
            let siloResult = await MasterPasteurizationSilosModel.findOne({
                attributes: {
                    exclude: [
                        "createdAt",
                        "updatedAt",
                        "created_by",
                        "updated_by",
                        "created_on",
                        "updated_on",
                    ],
                },
                where: {
                    id: siloId,
                },
            });
            // if silo not found
            if (!siloResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, `silo not found`, currentRoute, ""),
                });
            }
            siloResult = jsonFormator(siloResult);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "silo fetched succesfully !",
                    currentRoute,
                    siloResult
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async reactivateSilo(data, socket, io, currentRoute) {
        try {
            const { siloId } = data;
            if (!siloId || siloId < 1) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute, ""),
                });
            }
            let silosTobeActivated = await MasterPasteurizationSilosModel.findOne({
                where: {
                    id: siloId,
                },
            });
            if (silosTobeActivated.status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.notEx, currentRoute, ""),
                });
            }
            if (silosTobeActivated.status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `The silo  ' ${silosTobeActivated.silo_name} ' is already  Active`,
                        currentRoute,
                        ""
                    ),
                });
            }
            silosTobeActivated = jsonFormator(silosTobeActivated);
            // if selectd silo is permanent silo
            //   if (!silosTobeDeleted.is_deletable) {
            //     return socket.emit(currentRoute, {
            //       ...apiResponse.error(
            //         false,
            //         `Can't delete a permanent silo`,
            //         currentRoute,
            //         ""
            //       ),
            //     });
            //   }
            const [isActivated] = await MasterPasteurizationSilosModel.update(
                {
                    status: true,
                },
                {
                    where: {
                        id: siloId,
                    },
                }
            );
            if (!isActivated) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `Error while activating silo ' ${silosTobeActivated.silo_name}'`,
                        currentRoute,
                        ""
                    ),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    `silo '${isActivated.silo_name}' activated successfully`,
                    currentRoute
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
};
export default masterPasteurizationSiloControllers;
