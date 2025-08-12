import { MasterEntryTypeModel } from "../../model/masterEntryType.model.js";
import { apiResponse } from "../../utility/response.util.js";
import Yup from "yup";
import { jsonFormator } from "../../utility/toJson.util.js";
import { customMessage } from "../../utility/messages.util.js";
const masterEntryTypeControllers = {
    async createEntryType(data, socket, io, currentRoute) {
        try {
            const paymentTypeSchema = Yup.object({
                name: Yup.string().required("Please provide entry name !"),
                priorityLevel: Yup.string()
                    .oneOf(
                        ["permanent", "temporary"],
                        "Please select PaymentType priority level like , permanent or temporary"
                    )
                    .default("temporary"),
            });
            const { name, priorityLevel } = await paymentTypeSchema.validate(data);
            const entryTypeExists = await MasterEntryTypeModel.findOne({
                where: {
                    name: name,
                },
            });
            if (entryTypeExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `Entry Type  ' ${name} '` + customMessage.exists
                    ),
                });
            }
            let entryTypeResult = await MasterEntryTypeModel.create({
                name: name,
                is_deletable: priorityLevel == "permanent" ? false : true,
            });
            if (!entryTypeResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        customMessage.creaErr + `${name}`,
                        currentRoute
                    ),
                });
            }

            entryTypeResult = jsonFormator(entryTypeResult);

            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    `Entry type  ' ${name} '` + customMessage.creaSucc,
                    currentRoute
                ),
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
    async updateEntryType(data, socket, io, currentRoute) {
        try {
            const paymentTypeSchema = Yup.object({
                entyTypeId: Yup.number(customMessage.badReq).required(
                    customMessage.badReq
                ),
                name: Yup.string().required("Please provide entry name !"),
            });
            const { entyTypeId, name } = await paymentTypeSchema.validate(data);
            let isExists = await MasterEntryTypeModel.findOne({
                where: {
                    id: entyTypeId,
                },
            });
            if (!isExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Entry Type " + customMessage.notEx,
                        currentRoute
                    ),
                });
            }
            isExists = jsonFormator(isExists);
            console.table(isExists);
            if (!isExists.is_deletable) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.cantModify, currentRoute),
                });
            }
            let [updateResult] = await MasterEntryTypeModel.update(
                {
                    name: name,
                },
                {
                    where: {
                        id: entyTypeId,
                    },
                }
            );
            if (!updateResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Entry type not updated !!",
                        currentRoute
                    ),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    `Entry type ${name} updated successfully !!`
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getEntryTypeById(data, socket, io, currentRoute) {
        try {
            const { entyTypeId = false } = data;
            if (!entyTypeId || entyTypeId < 1) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute),
                });
            }
            let paymentTypeById = await MasterEntryTypeModel.findOne({
                where: {
                    id: entyTypeId,
                },
            });
            if (!paymentTypeById) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Entry type not found !!",
                        currentRoute,
                        "Entry type not found !!"
                    ),
                });
            }
            paymentTypeById = jsonFormator(paymentTypeById);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Entry type fetched successfully!!",
                    currentRoute,
                    paymentTypeById
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getAllEntryType(data, socket, io, currentRoute) {
        try {
            let allEntryTypes = await MasterEntryTypeModel.findAll();
            allEntryTypes = jsonFormator(allEntryTypes);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Entry type fetched successfully!!",
                    currentRoute,
                    allEntryTypes
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async deleteEntryType(data, socket, io, currentRoute) {
        try {
            const { entyTypeId = false } = data;
            if (!entyTypeId || entyTypeId < 1) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute),
                });
            }
            let isExists = await MasterEntryTypeModel.findOne({
                where: {
                    id: entyTypeId,
                },
            });
            if (!isExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Entry Type " + customMessage.notEx,
                        currentRoute
                    ),
                });
            }
            if (!isExists.is_deletable) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.cantDel, currentRoute),
                });
            }
            let [updateResult] = await MasterEntryTypeModel.update(
                {
                    status: false,
                },
                {
                    where: {
                        id: entyTypeId,
                    },
                }
            );
            if (!updateResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.delErr, currentRoute),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    `Entry type '${isExists.name} ` + customMessage.delSucc,
                    currentRoute
                ),
            });
            this.getAllEntryType(
                data,
                socket,
                io,
                "ms-entry-type:all"
            );
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
};

export default masterEntryTypeControllers;
