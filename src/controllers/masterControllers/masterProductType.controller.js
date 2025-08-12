import { MasterProductTypeModel } from "../../model/masterProductType.model.js";
import { apiResponse } from "../../utility/response.util.js";
import Yup from "yup";
import { Op } from "sequelize"
import { idSchema } from "../../yup-schemas/idSchema.schema.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { customMessage } from "../../utility/messages.util.js";
const productTypeSchema = Yup.object({
    name: Yup.string().required("Product Type Name is required"),
});
const masterProductTypeControllers = {
    async createProductType(data, socket, io, currentRoute) {
        console.log("hitted ");
        try {
            const { name } = await productTypeSchema.validate(data);
            const productTypeExists = await MasterProductTypeModel.findOne({
                where: {
                    name: name,
                },
            });
            if (productTypeExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `Product Type ' ${name} ' already exists !!`
                    ),
                });
            }
            const createResult = await MasterProductTypeModel.create({
                name: name,
                created_by: socket.user.id,
            });
            console.log("creation result =>", createResult);
            if (!createResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Failed to create Product Type"),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Product Type Created Successfully",
                    currentRoute
                ),
            });
            this.getAllProductTypes(data, socket, io, "ms-product-type:all");
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
    async updateProductType(data, socket, io, currentRoute) {
        try {
            const updateSchema = productTypeSchema.concat(idSchema);
            const { name, id } = await updateSchema.validate(data);
            let productTypeExists = await MasterProductTypeModel.findOne({
                where: {
                    name: name,
                    id: {
                        [Op.not]: id,
                    },
                },
            });
            let productTypeDetails = await MasterProductTypeModel.findByPk(id);
            if (!productTypeDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "product type " + customMessage.notEx, currentRoute),
                });
            }
            // check wether product type with same name is already exists 
            if (productTypeExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        `Product Type Name ${name} already exists!!`
                    ),
                });
            }
            productTypeDetails = jsonFormator(productTypeDetails);
            console.table(productTypeDetails)
            if (name == productTypeDetails.name) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        customMessage.noChange, currentRoute
                    ),
                });
            }
            const [updateResult] = await MasterProductTypeModel.update(
                {
                    name: name,
                },
                { where: { id } }
            );
            if (!updateResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Failed to update Product Type"),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    updateResult,
                    "Product Type Updated Successfully"
                ),
            });
            this.getAllProductTypes(
                data,
                socket,
                io,
                "ms-product-type:all"
            );
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
    async deleteProductType(data, socket, io, currentRoute) {
        try {
            const { id } = await idSchema.validate(data);
            const [deleteResult] = await MasterProductTypeModel.update(
                {
                    status: false,
                    updated_by: socket.user.id,
                },
                {
                    where: { id },
                }
            );
            if (!deleteResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Failed to delete Product Type"),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "Product Type Deleted Successfully"),
            });
            this.getAllProductTypes(
                data,
                socket,
                io,
                "ms-product-type:all"
            );
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
    async getAllProductTypes(data, socket, io, currentRoute) {
        // Define the query condition to filter only active product types
        const condition = {
            where: {
                status: true,
            },
            order: [["created_on", "DESC"]], // Fixed the order syntax
        };
        try {
            // Fetch all product types that match the condition
            const productTypes = await MasterProductTypeModel.findAll(condition);
            // Emit success response with the fetched product types
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Product Types Fetched Successfully",
                    currentRoute,
                    productTypes
                ),
            });
        } catch (error) {
            // Log the error for debugging purposes
            console.error("Error fetching product types:", error);
            // Emit error response with the error details
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getProductTypeById(data, socket, io, currentRoute) {
        try {
            const { id } = await idSchema.validate(data);
            let productType = await MasterProductTypeModel.findOne({
                attributes: ["name", "id", "status"],
                where: { id },
            });
            if (!productType) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Product Type Not Found", currentRoute),
                });
            }
            productType = jsonFormator(productType);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "product type fetched successfully",
                    currentRoute,
                    productType
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
};
export default masterProductTypeControllers;
