import Yup from "yup";
import { apiResponse } from "../../utility/response.util.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { MasterSilosModel } from "../../model/masterSilos.model.js";
import { customMessage } from "../../utility/messages.util.js";
import { changeDetector } from "../../utility/changeDetector.util.js";
const mastersilosControllers = {
    async getAllSilos(data, socket, io, currentRoute) {
        try {
            let allSilos = await MasterSilosModel.findAll({
                where: { status: true },
                attributes: {
                    exclude: [
                        "created_by",
                        "updated_by",
                        "updated_on",
                        "is_deletable",
                    ],
                },
                order: [["created_on", "DESC"]],
            });
            allSilos = jsonFormator(allSilos);
            allSilos = allSilos.map((silo) => {
                return {
                    ...silo,
                    empty_space: silo.capacity - silo.total_available_milk,
                }
            })
            if (!allSilos) {
                socket.emit("error", {
                    ...apiResponse.error(false, "Silos not found !", currentRoute),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Silos fetched successfully !!",
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
                siloName: Yup.string("invalid silo name").required(
                    "Silo name is required"
                ),
                capacity: Yup.number("Silo capacity must be a number !")
                    .min(1, "Silo capacity must be greater than 1")
                    .max(
                        "9223372036854775807",
                        "Silo capacity cannot be greater than 9223372036854775807"
                    )
                    .required("Silo capacity is required"),
                availableMilk: Yup.number("Available milk must be number")
                    .min(0, "Available Milk can't be negative !")
                    .default(0)
                    .test(
                        "capacity-greater-than-available-milk",
                        "available-milk cannot be greater than silos capacity",
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
            const { siloName, capacity, availableMilk, status } =
                await siloSchema.validate(data, {
                    abortEarly: true,
                    stripUnknown: true,
                });
            const issiloExists = await MasterSilosModel.findOne({
                where: {
                    silo_name: siloName,
                    capacity,
                    //   total_available_milk: availableMilk,
                    //   is_deletable: true,
                    //   is_deletable: priorityLevel == "parmanent" ? false : true,
                    //   status,
                },
            });
            if (issiloExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `silo '${siloName} already exists`,
                        currentRoute,
                        ""
                    ),
                });
            }
            let siloCreationResult = await MasterSilosModel.create({
                silo_name: siloName,
                capacity,
                total_available_milk: availableMilk,
                // is_deletable: priorityLevel == "permanent" ? false : true,
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
                    `Silo '${siloName} ' created successfully !`,
                    currentRoute
                ),
            });
            // to relad all silos
            this.getAllSilos(data, socket, io, "ms-silos:all");
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
                siloName: Yup.string().required("Silo name is required"),
                capacity: Yup.number("Silo capacity must be a number !")
                    .min(1, "Silo capacity must be greater than 1")
                    .required("Silo capacity is required"),
                availableMilk: Yup.number("Available milk must be number")
                    .min(0, "Available Milk can't be negative !")
                    .default(0),
                // priorityLevel: Yup.string()
                //   .oneOf(
                //     ["permanent", "temporary"],
                //     "Please select silo priority level like , permanent or temporary"
                //   )
                //   .required("priority level is required !"),
                status: Yup.boolean("Please select silo status").default(true),
            });
            const { siloId, siloName, capacity, availableMilk, status } =
                await siloSchema.validate(data, {
                    abortEarly: true,
                    stripUnknown: true,
                });
            let siloToUpdate = await MasterSilosModel.findByPk(siloId, {
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
                    ...apiResponse.error(false, `silo not found`, currentRoute, ""),
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
            const [updateResult] = await MasterSilosModel.update(
                {
                    silo_name: siloName,
                    capacity,
                    total_available_milk: availableMilk,
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
                        `Silo '${siloName}' not updated `,
                        currentRoute
                    ),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    `This Silo has been updated successfully !!`,
                    currentRoute
                ),
            });
            // to relad all silos
            this.getAllSilos(data, socket, io, "ms-silos:all");
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
            let silosTobeDeleted = await MasterSilosModel.findOne({
                where: {
                    id: siloId,
                },
            });
            if (!silosTobeDeleted) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.notEx, currentRoute, ""),
                });
            }
            silosTobeDeleted = jsonFormator(silosTobeDeleted);
            if (!silosTobeDeleted.status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `The silo  ' ${silosTobeDeleted.silo_name} ' is already inactive / deleted.`,
                        currentRoute,
                        ""
                    ),
                });
            }
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
            const [isDeleted] = await MasterSilosModel.update(
                {
                    status: false,
                    updated_by: socket.user.id,
                    updated_on: new Date(),
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
                    `Silo '${silosTobeDeleted.silo_name}' deleted successfully`,
                    currentRoute
                ),
            });
            // to relad all silos
            this.getAllSilos(data, socket, io, "ms-silos:all");
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
            let siloResult = await MasterSilosModel.findOne({
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
                    ...apiResponse.error(false, `Silo not found`, currentRoute, ""),
                });
            }
            siloResult = jsonFormator(siloResult);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Silo fetched succesfully !",
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
            let silosTobeActivated = await MasterSilosModel.findOne({
                where: {
                    id: siloId,
                },
            });
            if (!silosTobeActivated) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "silo " + customMessage.notEx,
                        currentRoute,
                        ""
                    ),
                });
            }
            silosTobeActivated = await jsonFormator(silosTobeActivated);
            console.table(silosTobeActivated);
            if (silosTobeActivated.status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `The silo  ' ${silosTobeActivated.silo_name} ' is already Active !`,
                        currentRoute,
                        ""
                    ),
                });
            }
            //   silosTobeActivated = jsonFormator(silosTobeActivated);
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
            const [isActivated] = await MasterSilosModel.update(
                {
                    status: true,
                    updated_by: socket.user.id,
                    updated_on: new Date(),
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
                    `Silo '${silosTobeActivated.silo_name}' activated successfully !!`,
                    currentRoute
                ),
            });
            // to relad all silos
            this.getAllSilos(data, socket, io, "ms-silos:all");
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
};
export default mastersilosControllers;
