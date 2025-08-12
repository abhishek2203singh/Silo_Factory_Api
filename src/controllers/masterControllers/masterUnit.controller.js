/* eslint-disable no-unused-vars */
import jwt from "jsonwebtoken";
import { UnitModel } from "../../model/unit.model.js";
import { apiResponse } from "../../utility/response.util.js";
import Yup from "yup";
import { common } from "../../Common/common.js";
import { config } from "../../config/config.js";
import { response } from "express";
import { tokenFormater } from "../../utility/tokenFormat.util.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { customMessage } from "../../utility/messages.util.js";
const masterUnitController = {
    // get all product in database
    async getAllUnit(data, socket, io, currentRoute) {
        try {
            let filters = {
                where: {
                    status: true
                }
            }
            if (socket.user.id == 1) {
                filters = {}
            }
            const unitResult = await UnitModel.findAll({
                attributtes: {
                    exclude: ["created_on", "created_by", "updated_on"]
                },
                order: [["created_on", "DESC"]],
            }, filters);
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "unit data", currentRoute, unitResult),
            });
        } catch (error) {
            console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async createUnit(data, socket, io, currentRoute) {
        try {
            const unitSchema = Yup.object({
                unitName: Yup.string().required("Please, enter unit name"),
                shortName: Yup.string().required("Please, enter unit shortcut name!!"),
            });
            const { unitName, shortName } = await unitSchema.validate(data);
            const isUnitExists = await UnitModel.findOne({
                where: {
                    name: unitName,
                },
            });
            if (isUnitExists) {
                socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `Unit Name ${unitName} is already exists!!`,
                        currentRoute
                    ),
                });
            }
            let createUnitResult = await UnitModel.create({
                name: unitName,
                st_name: shortName,
                created_by: socket.user.id,
            });
            if (!createUnitResult) {
                socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Unit not created!!", currentRoute),
                });
            }
            createUnitResult = jsonFormator(createUnitResult);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    `Unit name ${unitName} created successfully!!`
                ),
            });
            this.getAllUnit(data, socket, io, "ms-unit:all");
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async updateUnit(data, socket, io, currentRoute) {
        try {
            const unitSchema = Yup.object({
                unitId: Yup.number(customMessage.badReq).required(customMessage.badReq),
                unitName: Yup.string().required("Please, enter unit name"),
                shortName: Yup.string().required("Please, enter unit shortcut name!!"),
            });
            const { unitId, unitName, shortName } = await unitSchema.validate(data);
            let isExists = await UnitModel.findOne({
                where: {
                    id: unitId
                }
            });
            if (!isExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, 'unit not found !!', currentRoute)
                });
            }
            let [updateResult] = await UnitModel.update({
                name: unitName,
                st_name: shortName,
            },
                {
                    where: {
                        id: unitId
                    }
                }
            );
            if (!updateResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "unit not updated !!", currentRoute)
                })
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, `unit ${unitName} updated successfully !!`)
            })
            this.getAllUnit(data, socket, io, "ms-unit:all");
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error)
            })
        }
    },
    async getUnitById(data, socket, io, currentRoute) {
        try {
            const { unitId = false } = data;
            if (!unitId || unitId < 1) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute)
                });
            }
            let unitById = await UnitModel.findOne({
                where: {
                    id: unitId
                }
            });
            if (!unitById) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, 'Unit not found !!', currentRoute, 'Unit not found !!')
                });
            }
            unitById = jsonFormator(unitById);
            socket.emit(currentRoute, {
                ...apiResponse.success(true, 'Unit fetched successfully!!', currentRoute, unitById)
            })
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error)
            })
        }
    },
};
export default masterUnitController;
