import { ProductModel } from "../model/product.model.js";
import { apiResponse } from "../utility/response.util.js";
import Yup from "yup";
import { productSchema } from "../yup-schemas/product.schema.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import { customMessage } from "../utility/messages.util.js";
import { VKProductMsUnit } from "../model/views/productMsUnitView.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { sequelize } from "../config/dbConfig.js";
import calc from "../utility/calculation.util.js";

const productControllers = {
    // get all product in database
    async getAllProduct(data, socket, io, currentRoute) {

        try {
            //   let productResult = await ProductModel.findAll({
            //     order: [[["created_on", "DESC"]]],
            //   });

            let productResult = await VKProductMsUnit.findAll({
                order: [["created_on", "DESC"]],
            });

            //   productResult = jsonFormator(productResult);

            // console.log("products =>", productResult);

            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "product data",
                    currentRoute,
                    productResult
                ),
            });
        } catch (error) {
            console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getProductByTypeId(data, socket, io, currentRoute) {
        try {
            const { ProductTypeId = false } = data;
            if (!ProductTypeId) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute)
                });
            }
            // Find all products with where clause and ordering
            const productResult = await VKProductMsUnit.findAll({
                // attributes: [
                // "product_name"
                // ],
                where: {
                    msProductType: ProductTypeId
                },
                order: [["created_on", "DESC"]]
            });
            // Emit success response
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "product data",
                    currentRoute,
                    productResult
                )
            });
        } catch (error) {
            console.error("error =>", error);
            // Emit error response
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error)
            });
        }
    },
    //   to create new product
    async insertProduct(data, socket, io, currentRoute) {
        console.log("Set Data Value : ", data);
        data.cgst = data.cgst ?? 0;
        data.sgst = data.sgst ?? 0;
        try {
            // Validate the data against the schema
            let {
                productName,
                productImage,
                unitId,
                sort,
                status,
                productType,
                roughProductId,
                mrp,
                basePrice,
                cgst,
                sgst,
                deliveryCharges,
                isGstIncluded,
            } = await productSchema.validate(data, {
                abortEarly: true,
                stripUnknown: true,
            });
            // Check if the product already exists
            const existingProduct = await ProductModel.findOne({
                where: {
                    product_name: productName,
                    rough_product_id: roughProductId,
                    // fresh_price: freshPrice,
                    // packed_price: packedPrice,
                    // ms_product_type_id: productType,
                },
            });
            if (existingProduct) {
                return socket.emit("error", {
                    ...apiResponse.error(
                        false,
                        "This product already exists",
                        currentRoute,
                        ""
                    ),
                });
            }


            // calculate mrp on the behalf of cgst and sgst

            const cgstValue = calc.percentageValue(basePrice, cgst);
            const sgstValue = calc.percentageValue(basePrice, sgst);
            const calculatedMrp = Number(basePrice) + cgstValue + sgstValue
            const isAccurateMrp = calculatedMrp == mrp;


            if (cgst || sgst) {
                const cGst = Number(cgst);
                const sGst = Number(sgst);
                const base = Number(basePrice)
                const cgstValue = ((base * cGst) / 100)
                const sgstValue = ((base * sGst) / 100)

                const isMrpIsAccurate = base + cgstValue + sgstValue == mrp;

                if (!isMrpIsAccurate) {
                    mrp = base + cgstValue + sgstValue
                }
            }
            // Insert the new product into the database
            const newProduct = await ProductModel.create({
                product_name: productName,
                product_image: productImage,
                uom: unitId,
                rough_product_id: roughProductId,
                sort: sort,
                mrp: isAccurateMrp ? mrp : calculatedMrp,
                base_price: basePrice,
                cgst: isGstIncluded ? 0.00 : cgst,// if gst is inclued 
                sgst: isGstIncluded ? 0.00 : sgst,
                is_gst_included: isGstIncluded,
                delivery_charges: deliveryCharges,
                ms_product_type_id: productType,
                status: status,
                created_by: socket.user.id,
            });
            // Emit success response
            socket.emit("products:create", {
                ...apiResponse.success(
                    true,
                    "Product inserted successfully",
                    currentRoute,
                    newProduct
                ),
            });
            this.getAllProduct({}, socket, io, "products:all");
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
            console.error("Error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getProductById(data, socket, io, currentRoute) {
        try {
            const { id } = await idSchema.validate(data);
            console.log("product id =>", id);
            const productDetails = await ProductModel.findByPk(id);
            if (!productDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Product not found", currentRoute),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Product fetched successfully",
                    currentRoute,
                    productDetails
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
    async updateProduct(data, socket, io, currentRoute) {
        try {
            console.table(data);
            data.cgst = data.cgst ?? 0;
            data.sgst = data.sgst ?? 0;
            const updateProductSchema = productSchema.concat(idSchema);
            const {
                id,
                productName,
                productImage,
                unitId,
                sort,
                status,
                productType,
                roughProductId,
                mrp,
                basePrice,
                cgst,
                sgst,
                deliveryCharges,
                isGstIncluded
            } = await updateProductSchema.validate(data, {
                abortEarly: true,
                stripUnknown: true,
            });

            console.log("data =>", data);
            // return

            // check wether product exists or not

            const isExists = await ProductModel.findByPk(id, {
                where: {
                    status: true,
                },
            });
            if (!isExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Product " + customMessage.notEx,
                        currentRoute
                    ),
                });
            }


            // calculate mrp on the behalf of cgst and sgst

            const cgstValue = calc.percentageValue(basePrice, cgst);
            const sgstValue = calc.percentageValue(basePrice, sgst);
            const calculatedMrp = Number(basePrice) + cgstValue + sgstValue
            const isAccurateMrp = calculatedMrp == mrp;
            let [updateResult] = await ProductModel.update(
                {
                    product_name: productName,
                    product_image: productImage,
                    uom: unitId,
                    rough_product_id: roughProductId,
                    sort: sort,
                    mrp: isAccurateMrp ? mrp : calculatedMrp,
                    base_price: basePrice,
                    cgst,
                    sgst,
                    delivery_charges: deliveryCharges,
                    ms_product_type_id: productType,
                    is_gst_included: isGstIncluded,
                    status: status,
                    updated_at: sequelize.literal("CURRENT_TIMESTAMP"),
                    updated_by: socket.user.id
                },
                {
                    where: {
                        id: id,
                    },
                }
            );
            if (!updateResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(customMessage.wentWrong, currentRoute),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, customMessage.updSucc, currentRoute),
            });
            return this.getAllProduct(data, socket, io, "products:all");
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
    async getProductsByProductTypeId(data, socket, io, currentRoute) {
        try {
            const { id } = await idSchema.validate(data);
            console.log("product type id =>", id);
            let productDetails = await ProductModel.findAll({
                attributes: {
                    exclude: ["created_on", "updated_on", "created_by", "updated_by"],
                },
                where: {
                    ms_product_type_id: id,
                    status: true,
                },
            });
            productDetails = jsonFormator(productDetails);
            // console.log("products =>", productDetails);
            if (!productDetails.length) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Products not found", currentRoute),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Products fetched successfully",
                    currentRoute,
                    productDetails
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

export default productControllers;
