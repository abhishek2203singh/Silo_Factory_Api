/* eslint-disable no-unused-vars */
import { apiResponse } from "../utility/response.util.js";
import Yup from "yup";
import { packingProcessSchema } from "../yup-schemas/packingProcessEntry.schema.js";
import { PackingProcessModel } from "../model/packingProcees.model.js";
import { sequelize } from "../config/dbConfig.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { MasterStockModel } from "../model/masterStock.model.js";
import { MasterPackingSizeModel } from "../model/masterPackingSize.model.js";
import { ProductModel } from "../model/product.model.js";
import { customMessage } from "../utility/messages.util.js";
import { StockInfoModel } from "../model/stockInfo.model.js";
import { VkProductPackingSizeModel } from "../model/views/productPackingSizeView.modal.js";
import { UnitModel } from "../model/unit.model.js";
import { unitConverter } from "../utility/unitConverter.util.js";
import { PackingProcessViewModel } from "../model/views/packingProcessView.model.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
const packingProcessControllers = {
    // add detail of packing proceess
    async startPacking(data, socket, io, currentRoute) {
        try {
            const {
                productId,
                packingMaterialId,
                packingSizeId, // packing size of product which will be packed
                totalPackings,
            } = await packingProcessSchema.validate(data, {
                abordArly: true,
                striptunknown: true,
            });
            // product which is packed will be known as source product (ex. milked is packed in 200ml pouches milk is source product because 200ml pouch is made of milk )
            let sourceProductDetails = await ProductModel.findByPk(productId);
            if (!sourceProductDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.productNotExists, currentRoute),
                });
            }
            let sourceProductUom = await UnitModel.findByPk(sourceProductDetails.uom);
            sourceProductUom = jsonFormator(sourceProductUom).st_name
            console.log("source product uom =>", sourceProductUom);
            sourceProductDetails = jsonFormator(sourceProductDetails)
            console.table(sourceProductDetails)
            let packingMaterialDetails = await ProductModel.findByPk(packingMaterialId);
            if (!packingMaterialDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Packing material " + customMessage.notEx, currentRoute),
                });
            }
            packingMaterialDetails = jsonFormator(packingMaterialDetails);
            // find out capacity of packing material (Ex. how much quantity can be filled in selected packing size )
            let sourceProductsPackingSize = await VkProductPackingSizeModel.findOne({
                where: {
                    product_id: productId,// product which will be packed
                    packing_size_id: packingSizeId
                }
            });
            if (!sourceProductsPackingSize) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "packing size " + customMessage.notEx, currentRoute),
                });
            }
            // to get packing material's capacity unit
            sourceProductsPackingSize = jsonFormator(sourceProductsPackingSize);
            console.log("Packaging size details =>", sourceProductsPackingSize)
            // find our packing size id for packing material according to source product packing size details
            console.log("fetching packing material details =>")
            let packingMaterialSizeDetails = await VkProductPackingSizeModel.findOne({
                where: {
                    product_id: packingMaterialId,
                    weight: sourceProductsPackingSize.weight,
                    unit_id: sourceProductsPackingSize.unit_id
                }
            })
            if (!packingMaterialSizeDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Packing size " + customMessage.notEx + " for packing material " + packingMaterialDetails.product_name, currentRoute),
                });
            }
            packingMaterialSizeDetails = jsonFormator(packingMaterialSizeDetails)
            const { id: packingMaterialSizeId } = packingMaterialSizeDetails;
            console.log("packingMaterialSizeDetails =>", packingMaterialSizeDetails);
            // return
            // return
            console.log("packing material size id =>", packingMaterialSizeId)
            // find available stock of row product
            let stockOfSourceProduct = await MasterStockModel.findOne({
                where: {
                    product_id: productId,
                    master_packing_size_id: 0,
                    master_department_id: socket?.user?.department_id,
                    created_by: socket?.user.id,
                    is_packed_product: false
                },
            })
            if (!stockOfSourceProduct) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.insufficientStock + sourceProductDetails.product_name, currentRoute),
                });
            }
            stockOfSourceProduct = jsonFormator(stockOfSourceProduct);
            console.log("source product stock fetched ")
            //    total quantity in packing material capacity uom 
            const totolQtyInPackingMaterialCapacity = totalPackings * sourceProductsPackingSize.weight;
            // convert the unit of packed material according to the source product unit (Ex. convert 2000ml in to liters)
            // actual quantity of the source product
            const sourceProdPackedQty = unitConverter.convertUnit(totolQtyInPackingMaterialCapacity, sourceProductsPackingSize.st_name, sourceProductUom)
            console.log("quqntity will be packed =>", sourceProdPackedQty)
            // find available stock of packing materials 
            let packagingMaterialStock = await MasterStockModel.findOne({
                where: {
                    product_id: packingMaterialId,
                    master_packing_size_id: packingMaterialSizeId,
                    master_department_id: socket?.user?.department_id,
                    // created_by: socket?.user?.id,
                },
            })
            // in case packing material stock space is not exists
            if (!packagingMaterialStock) {
                console.log("in sufficient stock", {
                    product_id: packingMaterialId,
                    master_packing_size_id: packingSizeId,
                    master_department_id: socket?.user?.department_id,
                    created_by: socket?.user?.id,
                })
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.insufficientStock + packingMaterialDetails.product_name, currentRoute),
                });
            }
            packagingMaterialStock = jsonFormator(packagingMaterialStock);
            const packingMaterialHoldQty = Number(packagingMaterialStock.hold_quantity);
            // check if sufficient stock of packing material is available or not
            if ((packagingMaterialStock.available_qty - totalPackings) < 0) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Not enough stock of packing material available. current stock is " + packagingMaterialStock.available_qty, currentRoute, '')
                })
            }
            // available quqntity of source product 
            const sourceProductPrevStock = (stockOfSourceProduct?.available_qty) ?? 0;
            console.log("sourceProductPrevStock =>", sourceProductPrevStock);
            const sourceProductHoldQty = Number(stockOfSourceProduct.hold_quantity)
            // check whether sufficent source product is available or not
            if (sourceProductPrevStock - sourceProdPackedQty.result < 0) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, sourceProductDetails.product_name + ` is not sufficient only ' ${sourceProductPrevStock - sourceProductHoldQty} ' ${sourceProductUom} ${sourceProductDetails.product_name} is available and ${sourceProdPackedQty.result} ${sourceProductUom} is required , ${sourceProductHoldQty} ${sourceProductUom} in hold`) })
            }
            console.log({
                currnt_stock: sourceProductPrevStock,
                qtyToBeRemoved: sourceProdPackedQty.result
            })
            // return
            const transaction = await sequelize.transaction();
            // update current available quantity in source products stock space 
            try {
                // add all details in master packing process model
                console.log("packingMaterialSizeId before packing precess entry =>", packingMaterialSizeId)
                let processDetails = await PackingProcessModel.create({
                    packing_material_id: packingMaterialId,
                    master_packing_size_id: packingSizeId,// packing size of product which will be packed
                    product_id: productId,
                    packing_material_size_id: packingMaterialSizeId,
                    product_master_stock_id: stockOfSourceProduct.id,
                    packing_material_master_stock_id: packagingMaterialStock.id,
                    total_product_packed: sourceProdPackedQty.result,
                    total_packings: totalPackings,
                    material_quantity: totalPackings,
                    start_time: sequelize.literal("CURRENT_TIMESTAMP"),
                    created_by: socket?.user?.id,
                    is_finished: false
                }, { transaction });
                if (!processDetails) {
                    throw new Error("error while inserting in packing process table ");
                }
                processDetails = jsonFormator(processDetails)
                // subtract source product from the stock
                const [updateSourceQty] = await MasterStockModel.update({
                    available_qty: sequelize.literal(`available_qty - ${sourceProdPackedQty?.result}`),
                    hold_quantity: sequelize.literal(`hold_quantity + ${sourceProdPackedQty?.result}`)
                }, {
                    where: {
                        id: stockOfSourceProduct?.id,
                    },
                    transaction
                })
                console.log("source sotock update result => ", updateSourceQty)
                if (!updateSourceQty) {
                    throw new Error("error  while source product quantity update")
                }
                console.log("source product stock after removel =>>", Number(sourceProductPrevStock - sourceProdPackedQty))
                // insert source product removel entry in stock info table
                const sourceInfoInsert = await StockInfoModel.create({
                    master_stock_id: stockOfSourceProduct?.id,
                    department_id: socket?.user?.department_id,
                    dpt_table_ref_id: 0,
                    product_id: productId,
                    weight_per_unit: 0.00,
                    hold_quantity: stockOfSourceProduct.hold_quantity + sourceProdPackedQty,
                    quantity: sourceProdPackedQty.result,
                    trns_type: "OUT",
                    packing_process_id: processDetails.id,
                    product_type: sourceProductDetails?.ms_product_type_id ?? 0,
                    price_per_unit: sourceProductDetails?.fresh_price,
                    total_price: sourceProductDetails?.fresh_price * sourceProdPackedQty?.result,
                    trans_remark: "Packing process",
                    previous_stock: sourceProductPrevStock,
                    current_stock: Number(sourceProductPrevStock - sourceProdPackedQty.result),
                    created_by: socket?.user?.id,
                    distribution_center_id: 0,
                    retail_shop_id: 0
                }, { transaction })
                if (!sourceInfoInsert) {
                    throw new Error("error while inserting source product removal entry in stock info ");
                }
                // update current available quantity in packing materials stock space and add current quantity in hold
                const [updatePackingMaterialStock] = await MasterStockModel.update({
                    available_qty: sequelize.literal(`available_qty - ${totalPackings}`),
                    hold_quantity: sequelize.literal(`hold_quantity + ${totalPackings}`)
                }, {
                    where: {
                        id: packagingMaterialStock?.id,
                    },
                    transaction
                })
                console.log("updatePackingMaterialStock =>~~~~~~~~ ", updatePackingMaterialStock);
                if (!updatePackingMaterialStock) {
                    throw new Error("error while packing material quantity update")
                }
                // insert packing material removal entry in stock info table
                const packingMaterialInfoInsert = await StockInfoModel.create({
                    master_stock_id: packagingMaterialStock?.id,
                    department_id: socket?.user.department_id,
                    dpt_table_ref_id: 0,
                    product_id: packingMaterialId,
                    weight_per_unit: 0.00,
                    quantity: totalPackings,
                    hold_quantity: packagingMaterialStock.hold_quantity + totalPackings,
                    trns_type: "Out",
                    packing_process_id: processDetails.id,
                    product_type: packingMaterialDetails?.ms_product_type_id ?? 0,
                    price_per_unit: packingMaterialDetails?.fresh_price,
                    total_price: packingMaterialDetails?.total_price * totalPackings,
                    trans_remark: "Packing process",
                    previous_stock: packagingMaterialStock?.available_qty,
                    current_stock: packagingMaterialStock?.available_qty - totalPackings,
                    created_by: socket?.user?.id,
                    distribution_center_id: 0,
                    retail_shop_id: 0
                }, { transaction });
                if (!packingMaterialInfoInsert) {
                    throw new Error("error while inserting packing material removal entry in stock info ");
                }
                //update stock of packed product (product after packing, Ex. you have packed milk in pouche and the capacity of pouch in 500 ml ) 
                this.getAllPackingProcesses(
                    data,
                    socket,
                    io,
                    "packing-process:all"
                );
                await transaction.commit();
                socket.emit(currentRoute, { ...apiResponse.success(true, "Packing started successfully !", currentRoute) })
                // let finalProductDetails = await MasterStockModel.update()
            } catch (error) {
                await transaction.rollback();
                console.error("Error =>", error);
                socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute, error) })
            }
        } catch (error) {
            console.error("Error =>", error);
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
    async finishPacking(data, socket, io, currentRoute) {
        try {
            const { id } = await idSchema.validate(data);
            let packingProcess = await PackingProcessModel.findByPk(id);
            if (!packingProcess) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Packing details not found !", currentRoute, []),
                });
            }
            packingProcess = jsonFormator(packingProcess);
            console.log("packingProcess =>", packingProcess);
            const { product_id, packing_material_size_id, material_quantity, master_packing_size_id, total_packings, total_product_packed, packing_material_master_stock_id, product_master_stock_id } = packingProcess;
            let sourceProductsPackingSize = await MasterPackingSizeModel.findByPk(master_packing_size_id)
            if (!sourceProductsPackingSize) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Source product packing size not found !", currentRoute, []),
                });
            }
            // if stock is already finished
            if (packingProcess.is_finished) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Packing is already finished !", currentRoute, []),
                });
            }
            const transaction = await sequelize.transaction();
            try {
                // update packing process status
                const [finishedResult] = await PackingProcessModel.update({
                    is_finished: true,
                    updated_by: socket.user.id,
                    finish_time: sequelize.literal("CURRENT_TIMESTAMP"),
                    updated_on: sequelize.literal("CURRENT_TIMESTAMP")
                }, {
                    where: {
                        id: id
                    },
                    transaction
                })
                if (!finishedResult) {
                    throw new Error("error while changing packing status ")
                }
                // remove hold quantity from product (source product) stock
                const [sourceHoldQtyRemoved] = await MasterStockModel.update({
                    hold_quantity: sequelize.literal(`hold_quantity - ${total_product_packed}`)
                }, {
                    where: {
                        id: product_master_stock_id
                    },
                    transaction
                })
                if (!sourceHoldQtyRemoved) {
                    throw new Error("error while removing hold quantity from source product stock ")
                }
                // remove hold quantity from packing material
                const [packingMtrlHoldWtyRemoved] = await MasterStockModel.update({
                    hold_quantity: sequelize.literal(`hold_quantity - ${total_packings}`)
                }, {
                    where: {
                        id: packing_material_master_stock_id
                    },
                    transaction
                })
                if (!packingMtrlHoldWtyRemoved) {
                    throw new Error("error while removing hold quantity from packing material stock ")
                }
                // check wether stock space for final product is available or not
                let finalProductStockSpace = await MasterStockModel.findOne({
                    where: {
                        product_id: product_id,
                        master_packing_size_id: master_packing_size_id,
                        ms_product_type_id: 3,// 3 for factory products
                        unit_id: 5,
                        master_department_id: socket?.user?.department_id,
                        created_by: socket?.user?.id,
                        is_packed_product: true
                    },
                    transaction
                })
                console.log("is finished goods stock space found =>", finalProductStockSpace)
                let isNewCreated = false;
                if (!finalProductStockSpace) {
                    const finalStockSpace = await MasterStockModel.create({
                        master_department_id: socket?.user?.department_id,
                        master_packing_size_id: master_packing_size_id,
                        ms_product_type_id: 3,// 3 for factory products
                        product_id: product_id,
                        available_qty: total_packings,
                        status: 1,
                        unit_id: sourceProductsPackingSize?.unit_id,
                        is_packed_product: true,
                        created_by: socket?.user?.id,
                    }, { transaction })
                    //product space is created 
                    if (finalStockSpace) {
                        console.log("final product stock space created successfully", finalStockSpace)
                        isNewCreated = true;
                        finalProductStockSpace = finalStockSpace
                    }
                }
                // if stock space was already exists then update the available quantity
                if (!isNewCreated) {
                    finalProductStockSpace = jsonFormator(finalProductStockSpace)
                    const [updateFinalProductQty] = await MasterStockModel.update(
                        { available_qty: sequelize.literal(`available_qty + ${Number(total_packings)}`) },
                        {
                            where: { id: finalProductStockSpace?.id },
                            transaction
                        }
                    );
                    if (!updateFinalProductQty) {
                        throw new Error("error while updating final product quantity")
                    }
                }
                else {
                    finalProductStockSpace = jsonFormator(finalProductStockSpace)
                }
                // insert final product details in stock info
                let finalProdInfo = await StockInfoModel.create({
                    master_stock_id: finalProductStockSpace?.id,
                    department_id: socket?.user?.department_id,
                    dpt_table_ref_id: 0,
                    product_id: product_id,
                    weight_per_unit: sourceProductsPackingSize.weight,
                    quantity: total_packings,
                    trns_type: "IN",
                    packing_process_id: id,
                    master_packing_size_id: master_packing_size_id,
                    product_type: 3, // 3 for factory products
                    price_per_unit: sourceProductsPackingSize?.mrp,
                    total_price: Number(sourceProductsPackingSize?.mrp * total_packings),
                    trans_remark: "Packing process",
                    previous_stock: isNewCreated ? 0 : finalProductStockSpace?.available_qty - total_packings,
                    current_stock: isNewCreated ? Number(total_packings) : Number(finalProductStockSpace?.available_qty),
                    created_by: socket?.user?.id,
                    distribution_center_id: 0,
                    retail_shop_id: 0
                }, { transaction });
                if (!finalProdInfo) {
                    throw new Error("error while inserting final product details in stock info ");
                }
                // remove hold quantities
                await transaction.commit();
                socket.emit(currentRoute, { ...apiResponse.success(true, "Packing finished successfully !", currentRoute) })
            } catch (error) {
                socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.wentWrong, currentRoute) })
            }
            // change packing status
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
    // view all packing process
    async getAllPackingProcesses(data, socket, io, currentRoute) {
        try {
            const packingProcesses = await PackingProcessViewModel.findAll();
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "Packing processes fetched successfully", currentRoute, packingProcesses),
            });
        } catch (error) {
            console.error("Error =>", error);
            if (error instanceof Yup.ValidationError) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
        }
    }
}
export default packingProcessControllers;

