import Yup from "yup";
import { MasterPackingSizeModel } from "../../model/masterPackingSize.model.js";
import { apiResponse } from "../../utility/response.util.js";
import { customMessage } from "../../utility/messages.util.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { VkProductPackingSizeModel } from "../../model/views/productPackingSizeView.modal.js";
import { idSchema } from "../../yup-schemas/idSchema.schema.js";
import Op from "sequelize";
import { ProductModel } from "../../model/product.model.js";
import { UnitModel } from "../../model/unit.model.js";
import { unitConverter } from "../../utility/unitConverter.util.js";
const packingSizeSchema = Yup.object({
    weight: Yup.number()
        .typeError("Invalid weight / capacity ")
        .min(1, "weight / capacity  should be greater than 1")
        .required("Invalid weight / capacity"),
    unitId: Yup.number()
        .typeError("Please select valid unit")
        .required("Unit is required"),
    productId: Yup.number()
        .typeError("Please select valid product")
        .required("Product is required"),
    productType: Yup.number()
        .typeError("Please select valid product type")
    ,
    // mrp: Yup.number()
    //     .typeError("Invalid MRP")
    //     .min(1, "MRP should be greater than 1")
    //     .required("MRP is required"),
});
const masterPackingSizeControllers = {
    async createPackagingSize(data, socket, io, currentRoute) {
        try {
            const { weight, mrp, unitId, productId, productType } =
                await packingSizeSchema.validate(data);
            let price = 0.00
            // fetch product details 
            const productDetails = jsonFormator(await ProductModel.findByPk(productId));
            console.log({ productDetails })
            // fetch unit id details
            const packingUnitDetails = jsonFormator(await UnitModel.findByPk(unitId));
            // fetch product detail
            const productUnitDetils = jsonFormator(await UnitModel.findByPk(productDetails.uom));
            console.log({ productUnitDetils, packingUnitDetails })
            // convert the packing size weight in product unit 
            const weightInProductUnit = await unitConverter.convertUnit(weight, packingUnitDetails.st_name, productUnitDetils.st_name)
            // if product type is factory products then calculate price according to selected product 
            if (productType === 3) {
                // 
                const originalWeightInProductUnit = weightInProductUnit.result;
                // calculate the price
                price = Math.ceil(originalWeightInProductUnit * productDetails.mrp).toFixed(2);
                console.log({ weightInProductUnit, originalWeightInProductUnit, price })
            }
            // if mrp is not selected
            if (!mrp) {
                return socket.emit(currentRoute, { ...apiResponse.success(true, "please enter price ", currentRoute, null) });
            }
            // return
            const isExists = await MasterPackingSizeModel.findOne({
                where: {
                    product_id: productId,
                    unit_id: unitId,
                    weight: weight,
                    mrp: price,
                    ms_product_type_id: productType,
                },
            });
            if (isExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Packing Size" + customMessage.exists,
                        currentRoute
                    ),
                });
            }
            let insertData = await MasterPackingSizeModel.create({
                product_id: productId,
                unit_id: unitId,
                weight: weight,
                mrp: price ? price : mrp,
                ms_product_type_id: productType,
                created_by: socket.user.id,
            });
            if (!insertData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.creaErr, currentRoute),
                });
            }
            insertData = jsonFormator(insertData);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Packing Size" + customMessage.creaSucc + ` price  of ${weight} ${packingUnitDetails.st_name} ${productDetails.product_name} will be ₹ ${price ? price : mrp} `,
                    currentRoute,
                    insertData
                ),
            });
            return this.getAllPackingSizes(
                data,
                socket,
                io,
                "ms-packing-size:all"
            );
        } catch (error) {
            console.error("Error =>", error)
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async updatePackingSize(data, socket, io, currentRoute) {
        try {
            const updatePackingSizeSchema = packingSizeSchema.concat(idSchema);
            const { weight, mrp, productId, productType, unitId, id } =
                await updatePackingSizeSchema.validate(data);
            const isPresentData = await MasterPackingSizeModel.findOne({
                where: {
                    weight: weight,
                    mrp: mrp,
                    unit_id: unitId,
                    product_id: productId,
                    ms_product_type_id: productType,
                    id: { [Op.ne]: id },
                },
            });
            if (isPresentData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Packing Size already exists!!",
                        currentRoute
                    ),
                });
            }
            let [updatePackingData] = await MasterPackingSizeModel.update(
                {
                    product_id: productId,
                    unit_id: unitId,
                    weight: weight,
                    mrp: mrp,
                    ms_product_type_id: productType,
                },
                {
                    where: { id: id },
                }
            );
            if (!updatePackingData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Packing Size " + customMessage.updErr,
                        currentRoute,
                        ""
                    ),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Packing Size" + customMessage.updSucc,
                    currentRoute,
                    updatePackingData
                ),
            });
            return this.getAllPackingSizes(
                data,
                socket,
                io,
                "ms-packing-size:all"
            );
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getPackingSizeById(data, socket, io, currentRoute) {
        try {
            const { id } = await idSchema.validate(data);
            let byIdData = await MasterPackingSizeModel.findOne({
                where: {
                    id: id,
                },
            });
            if (!byIdData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Packing Size" + customMessage.notFound,
                        currentRoute,
                        ""
                    ),
                });
            }
            byIdData = jsonFormator(byIdData);
            return socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Data fetched successfully!!",
                    currentRoute,
                    byIdData
                ),
            });
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
            return socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getPackingSizesByProductId(data, socket, io, currentRoute) {
        try {
            const { productId = false } = data;
            console.log("gfgffddf", data);
            let byIdData;
            if (!productId) {
                byIdData = await VkProductPackingSizeModel.findAll();
            } else {
                console.log("sadfhjkfsdfdfjk>>>>>>", productId);
                byIdData = await VkProductPackingSizeModel.findAll({
                    where: {
                        product_id: productId,
                    },
                });
            }
            if (!byIdData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "packing Size" + customMessage.notFound,
                        currentRoute,
                        ""
                    ),
                });
            }
            // byIdData = jsonFormator(byIdData);
            return socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Data fetched successfully!!",
                    currentRoute,
                    byIdData
                ),
            });
        } catch (error) {
            return socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getAllPackingSizes(data, socket, io, currentRoute) {
        // const { product_id } = data;
        try {
            let packingSizes = await VkProductPackingSizeModel.findAll({
                order: [["created_on", "DESC"]],
                // attributes: [
                // "product_name"
                // ],
                // where: {
                //   product_id
                // },
            });
            // byIdData = jsonFormator(byIdData);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Data fetched successfully!!",
                    currentRoute,
                    packingSizes
                ),
            });
        } catch (error) {
            return socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
};
export default masterPackingSizeControllers;
