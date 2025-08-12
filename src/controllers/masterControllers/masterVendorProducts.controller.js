import Yup from "yup";
import { apiResponse } from "../../utility/response.util.js";
import { MasterVendorProductsModel } from "../../model/masterVendorProducts.model.js";
import { idSchema } from "../../yup-schemas/idSchema.schema.js";
import { MasterProductTypeModel } from "../../model/masterProductType.model.js";
import { Op } from "sequelize";
import { UserModel } from "../../model/user.model.js";
import { ProductModel } from "../../model/product.model.js";
import { VendorProductsViewModel } from "../../model/views/vendorProductView.js";
import { customMessage } from "../../utility/messages.util.js";
import { jsonFormator } from "../../utility/toJson.util.js";
const vendorProductSchema = Yup.object({
    vendorId: Yup.number().required("Vendor ID is required"),
    productTypeId: Yup.number().typeError("please select a valid product type").required("Product type is required"),
    productId: Yup.number().typeError("please select a valid product").required("Product is required"),
    // packingSizeId: Yup.number().required("Packing size is required"),
    price: Yup.number().typeError("please enter a valid price").required("Product price is required"),
})
const masterVendorProductsControllers = {
    // to assign products to the vendor with all details
    async assignProduct(data, socket, io, currentRoute) {
        try {
            const { vendorId, productTypeId, productId, price } = await vendorProductSchema.validate(data);
            // check wether selected product type exists 
            const isProductTypeExists = await MasterProductTypeModel.findByPk(productTypeId);
            if (!isProductTypeExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Selected product type does not exists", currentRoute),
                });
            }
            // is valid vendor is selectd 
            const isValidVendor = await UserModel.findOne({
                where: {
                    id: vendorId,
                    role_id: 5,
                },
            })
            // check wether valid proudct type and product is selected 
            const isValidProudctAndType = await ProductModel.findOne({
                where: {
                    id: productId,
                    ms_product_type_id: productTypeId,
                    status: true,
                },
            })
            if (!isValidProudctAndType) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Selected product or product type does not match", currentRoute),
                });
            }
            if (!isValidVendor) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Selected vendor does not exists", currentRoute),
                });
            }
            // check is selected product exists or not
            const productExists = await ProductModel.findByPk(productId);
            if (!productExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Selected product does not exists", currentRoute),
                });
            }
            // check wether product mappind is already exists 
            const vendorProductExists = await MasterVendorProductsModel.findOne({
                where: {
                    vendor_id: vendorId,
                    ms_product_type_id: productTypeId,
                    // master_packing_size_id: packingSizeId,
                    product_id: productId,
                },
            });
            if (vendorProductExists) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Product already exists", currentRoute) });
            }
            // assing product to vendor
            const createResult = await MasterVendorProductsModel.create({
                vendor_id: vendorId,
                ms_product_type_id: productTypeId,
                product_id: productId,
                price: price,
                // master_packing_size_id: packingSizeId,
                created_by: socket.user.id,
            })
            if (!createResult) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Failed to assign product", currentRoute) });
            }
            socket.emit(currentRoute, { ...apiResponse.success(true, "Product assigned successfully", currentRoute) });
            // to reload the Vendor Product data
            this.getAllProductsOfAllVendors(data, socket, io, "ms-vender-product:all");
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
    async updateVendorProducts(data, socket, io, currentRoute) {
        try {
            const updateVendorProductsSchema = vendorProductSchema.concat(idSchema);
            const { vendorId, productTypeId, productId, packingSizeId, price, id } = await updateVendorProductsSchema.validate(data);
            // check wether this prouduct exists or not
            const isExists = await MasterVendorProductsModel.findByPk(id);
            if (!isExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Product not found", currentRoute),
                });
            }
            // check wether selected product type exists 
            const isProductTypeExists = await MasterProductTypeModel.findOne({
                where: {
                    id: productTypeId,
                    status: true
                },
            });
            if (!isProductTypeExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Selected product type does not exists", currentRoute),
                });
            }
            // check is selected product exists or not
            const productExists = await ProductModel.findOne({
                where: {
                    id: productId,
                    status: true
                }
            });
            if (!productExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Selected product does not exists", currentRoute),
                });
            }
            // check wether product is already exists but with different id
            const vendorProductExistsDifferentId = await MasterVendorProductsModel.findOne({
                where: {
                    vendor_id: vendorId,
                    ms_product_type_id: Number(productTypeId),
                    product_id: Number(productId),
                    id: { [Op.ne]: id },
                },
            });
            if (vendorProductExistsDifferentId) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Product already exists !", currentRoute),
                });
            }
            // update product 
            const [updateResult] = await MasterVendorProductsModel.update(
                {
                    price: price,
                    product_type_id: productTypeId,
                    master_packing_size_id: packingSizeId,
                    product_id: productId,
                },
                {
                    where: {
                        id: id,
                    },
                }
            );
            if (!updateResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Failed to update product", currentRoute)
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "Product updated successfully", currentRoute),
            });
            // to reload the Vendor Product data
            this.getAllProductsOfAllVendors(data, socket, io, "ms-vender-product:all");
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
    // get vendor product types by vendor id 
    async getVendorProductTypesByVendorId(data, socket, io, currentRoute) {
        try {
            const isAdmin = socket.user.id === 1 ? true : false;
            const { id: vendorId } = await idSchema.validate(data);
            let condition = { vendor_id: vendorId }
            if (!isAdmin) {
                condition = { ...condition, status: true }
            }
            const vendorProductTypes = await VendorProductsViewModel.findAll({
                where: condition,
                attributes: ["product_type_name", "ms_product_type_id", "vendor_id"],
                group: ["ms_product_type_id"]
            });
            if (vendorProductTypes.length == 0) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Products not assigned " + customMessage.cntAdmin, currentRoute),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "product type fetched successfully", currentRoute, vendorProductTypes)
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
    // get product price according to vendor id product types and product id by vendor id
    async getVendorProductPriceByVendorId(data, socket, io, currentRoute) {
        try {
            const isAdmin = socket.user.id === 1 ? true : false;
            const vendorProductData = vendorProductSchema.omit(['price']);
            const { productId, productTypeId, packingSizeId, vendorId } = await vendorProductData.validate(data);
            let condition = { vendor_id: vendorId, product_id: productId, ms_product_type_id: productTypeId, msPackingId: packingSizeId }
            if (!isAdmin) {
                condition = { ...condition, status: true }
            }
            const vendorProductTypes = await VendorProductsViewModel.findAll({
                where: condition,
                // attributes: ["product_type_name", "ms_product_type_id", "vendor_id",],
                // group: ["ms_product_type_id"]
            });
            if (vendorProductTypes.length == 0) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Products not assigned " + customMessage.cntAdmin, currentRoute),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "product type fetched successfully", currentRoute, vendorProductTypes)
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
    ,
    // get all products of vendor
    async getAllVendorProducts(data, socket, io, currentRoute) {
        try {
            const isAdmin = socket.user.id === 1;
            // ✅ Vendor ID + Product Type ID validation
            const { id: vendorId, ms_product_type_id } = await Yup.object({
                id: Yup.number().required("Vendor ID is required"),
                ms_product_type_id: Yup.number().required("Product type ID is required")
            }).validate(data);
            // console.log("Vendor ID:", vendorId, "Product Type ID:", ms_product_type_id);
            let conditions = { vendor_id: vendorId, ms_product_type_id };
            if (!isAdmin) {
                conditions.status = true;
            }
            const vendorProducts = await VendorProductsViewModel.findAll({
                where: conditions,
                attributes: [
                    "product_name",
                    "price",
                    "ms_product_type_id",
                    "product_id",
                    "vendor_id"
                ],
                group: ["product_id"]
            });
            if (!vendorProducts.length) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "No products found for this product type", currentRoute),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "Products fetched successfully", currentRoute, vendorProducts)
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
    ,
    async changeVendorProductStatus(data, socket, io, currentRoute) {
        try {
            const vendorProductStatusSchema = Yup.object({
                vendorId: Yup.number().typeError("Please select a valid vendor!")
                    .required("Please select a valid vendor"),
                productId: Yup.number().typeError("Please select a valid product!")
                    .required("Please select a valid product"),
                status: Yup.boolean().required("Status is required")
            });
            const { vendorId, productId, status } = await vendorProductStatusSchema.validate(data);
            const vendorProduct = await MasterVendorProductsModel.findOne({
                where: {
                    vendor_id: vendorId,
                    product_id: productId,
                },
            });
            if (!vendorProduct) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Product " + customMessage.notEx, currentRoute),
                });
            }
            const existingStatus = vendorProduct.status;
            // No update needed
            if (existingStatus === status) {
                const msg = status ? "Product is already active" : "Product is already deactivated";
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, msg, currentRoute),
                });
            }
            const [updateCount] = await MasterVendorProductsModel.update(
                { status: status },
                {
                    where: {
                        vendor_id: vendorId,
                        product_id: productId,
                    },
                }
            );
            if (!updateCount) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Failed to update status", currentRoute),
                });
            }
            const successMsg = status ? "Product activated successfully" : "Product deactivated successfully";
            socket.emit(currentRoute, {
                ...apiResponse.success(true, successMsg, currentRoute),
            });
            // Refresh vendor product list
            this.getAllProductsOfAllVendors(data, socket, io, "ms-vender-product:all");
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
    // detail of product by id this will be used when update the data
    async detailsById(data, socket, io, currentRoute) {
        try {
            const { id } = await idSchema.validate(data);
            // check wether details exists  
            let vendorProductExists = await MasterVendorProductsModel.findByPk(id);
            if (!vendorProductExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Vendor product not found", currentRoute),
                });
            }
            vendorProductExists = jsonFormator(vendorProductExists);
            return socket.emit(currentRoute, {
                ...apiResponse.success(true, "Vendor product details fetched successfully", currentRoute, vendorProductExists),
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
    // to get all products of all vendors
    async getAllProductsOfAllVendors(data, socket, io, currentRoute) {
        try {
            let allProducts = await VendorProductsViewModel.findAll({
                order: [[["created_on", "DESC"]]],
            });
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "All products of all vendors fetched successfully", currentRoute, allProducts)
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    }
    // to view all products of vendor 
    // async getAllVendorProducts(data, socket, io, currentRoute) {
    //     try {
    //     } catch (error) {
    //         if (error instanceof Yup.ValidationError) {
    //             return socket.emit(currentRoute, {
    //                 ...apiResponse.error(false, error.message, currentRoute, error),
    //             });
    //         }
    //         socket.emit("error", {
    //             ...apiResponse.error(false, error.message, currentRoute, error),
    //         });
    //     }
    // }
}
export default masterVendorProductsControllers;