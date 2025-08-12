/* eslint-disable no-unused-vars */
import jwt from "jsonwebtoken";
import { UnitModel } from "../model/unit.model.js";
import { apiResponse } from "../utility/response.util.js";
import Yup from "yup";
import { common } from "../Common/common.js";
import { config } from "../config/config.js";
import { response } from "express";
import { tokenFormater } from "../utility/tokenFormat.util.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import { customMessage } from "../utility/messages.util.js";
import { ProductModel } from "../model/product.model.js";
import { UnitConversionMapModel } from "../model/unitConversionMap.model.js";
import { jsonFormator } from "../utility/toJson.util.js";


const unitControllers = {
    // get all product in database
    async getAllUnit(data, socket, io, currentRoute) {
        try {
            const unitResult = await UnitModel.findAll({
                order: [["created_on", "DESC"]],
            });
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
    // to get all possible unit in which a product can be stored by product id for example => the main unit of milk is liter(l) and liter canbe converted into ['ml','l','kl',]  
    async getAllSupportedUnitsByProductId(data, socket, io, currentRoute) {
        try {
            const { id: productId } = await idSchema.validate(data);
            //   find product details by product id
            const productDetails = await ProductModel.findOne({
                where: {
                    id: productId,
                    status: true
                }
            })
            if (!productDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Product" + customMessage.notEx + "or disabled",
                        currentRoute,
                        ""
                    ),
                });
            }

            const { uom } = jsonFormator(productDetails);

            const allPossibleConversions = await UnitConversionMapModel.findAll({
                attributes: {
                    exclude: ["created_on", "updated_on", "created_by", "updated_by", "unit_id",],
                },
                where: {
                    unit_id: uom,
                },
            })
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "All possible units for product", currentRoute, allPossibleConversions),
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


    // get all possible canversion units by unit id

    async getAllPossibleUnitConversions(data, socket, io, currentRoute) {
        try {
            const { id: unitId } = await idSchema.validate(data);
            const allPossibleConversions = await UnitConversionMapModel.findAll({
                attributes: {
                    exclude: ["created_on", "updated_on", "created_by", "updated_by",],
                },
                where: {
                    unit_id: unitId,
                },
            })
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "All possible conversions", currentRoute, allPossibleConversions),
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
    }
};
export default unitControllers;
