import moment from "moment";
import { Op } from "sequelize";
import { MasterPackingSizeModel } from "../model/masterPackingSize.model.js";
import { ProductModel } from "../model/product.model.js";
import { RetailShopDepartmentModal } from "../model/retailShop.modal.js";
import { customMessage } from "../utility/messages.util.js";
import { apiResponse } from "../utility/response.util.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { retailShopSchema } from "../yup-schemas/retailShop.schema.js";
import { sequelize } from "../config/dbConfig.js";
import { RetailShopDepartmentUpdateModal } from "../model/retailShopUpdate.modal.js";
import { DistributionCenterDepartmentModal } from "../model/distributionCenter.modal.js";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
import { DistributionCenterDepartmentUpdateModal } from "../model/distributionCenterDepartmentUpdate.modal.js";
import { VKRetailShopDepartmentModal } from "../model/views/retailShopView.modal.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import { MasterStockModel } from "../model/masterStock.model.js";
import { StockInfoModel } from "../model/stockInfo.model.js";
import { forReturnStockSchema } from "../yup-schemas/stockReturn.schema.js";
const retailShopController = {
    async addEntry(data, socket, io, currentRoute) {
        try {
            retailShopSchema;
            const { entryType, productId, quantity, packingSizeId }
                = await retailShopSchema.validate(data);
            const currentTime = moment();
            const fiveMinutesAgo = moment().subtract(5, 'minutes');
            const checkDupticateEntry = await RetailShopDepartmentModal.findOne({
                where: {
                    retail_user_id: socket.user.id,
                    entry_type_id: entryType,
                    product_id: productId,
                    quantity: quantity,
                    created_on: {
                        [Op.between]: [fiveMinutesAgo.toDate(), currentTime.toDate()]
                    }
                }
            })
            if (checkDupticateEntry) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.dup, currentRoute, '')
                })
            }
            let packingData = await MasterPackingSizeModel.findByPk(packingSizeId)
            if (!packingData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Packing Unit" + customMessage.notEx,
                        currentRoute,
                        ""
                    ),
                });
            }
            const { weight, unit_id: unitId } = jsonFormator(packingData);
            let msProductUnit = await ProductModel.findByPk(productId);
            if (!msProductUnit) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Packing size" + customMessage.notEx,
                        currentRoute,
                        ""
                    ),
                });
            }
            const { ms_product_type_id: productTypeId } = jsonFormator(msProductUnit);
            let departmentDetails = await MasterDepartmentModel.findByPk(2);
            if (!departmentDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Department" + customMessage.notEx, currentRoute, "")
                });
            }
            const { table_name } = jsonFormator(departmentDetails);
            let nextId = await DistributionCenterDepartmentModal.max("id");

            nextId = nextId == null ? 1 : nextId + 1;

            const transaction = await sequelize.transaction();
            let insertRetailData = await RetailShopDepartmentModal.create({
                retail_user_id: socket.user.id,
                entry_type_id: entryType,
                product_id: productId,
                ms_product_type_id: productTypeId,
                master_packing_size_id: packingSizeId,
                quantity: quantity,
                priceper_unit: 0,
                bill_image: null,
                weight_per_unit: weight,
                department_id: 6,
                distribution_center_id: socket.user.distribution_center_id,
                created_by: socket.user.id
            }, { transaction });
            if (!insertRetailData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.notFound, currentRoute, '')
                })
            }
            insertRetailData = jsonFormator(insertRetailData);
            const insertedId = insertRetailData.id;
            delete insertRetailData.id;
            const cloneInsertRetailData = await RetailShopDepartmentUpdateModal.create({
                ...insertRetailData,
                ref_table_id: insertedId,
                activity: "New",
            }, { transaction })
            if (!cloneInsertRetailData) {
                throw new Error(
                    "Error in creating second entry in pasteurization-department_update table =>"
                );
            }
            let insertDistributionData = await DistributionCenterDepartmentModal.create({
                entry_type_id: entryType,
                retail_table_ref_id: insertedId,
                product_id: productId,
                quantity: quantity,
                ms_product_type_id: productTypeId,
                master_packing_size_id: packingSizeId,
                // unit_id: unitId,
                unit_id: packingSizeId ? 5 : unitId,//if packing size is selected then unit will be pcs else according to selected unit,
                department_id: 7,
                priceper_unit: 0,
                departmenthead_id: socket.user.id,
                dist_center_id: socket.user.distribution_center_id,
                db_table_name: table_name,
                db_table_id: nextId,
                created_by: socket.user.id,
            }, { transaction });
            if (!insertDistributionData) {
                throw new Error("error while inserting ");
            }
            insertDistributionData = jsonFormator(insertDistributionData);
            const insertId = insertDistributionData.id;
            delete insertDistributionData.id;
            const cloneDistributionData = await DistributionCenterDepartmentUpdateModal.create({
                ...insertDistributionData,
                ref_table_id: insertId,
                activity: "New",
            }, { transaction });
            if (!cloneDistributionData) {
                throw new Error(
                    "Error in creating second entry in pasteurization-department_update table =>"
                );
            }
            await transaction.commit();
            socket.emit(currentRoute, {
                ...apiResponse.success(true, customMessage.creaSucc, currentRoute)
            });
            return this.getAllData(data, socket, io, "retail-dpt:all");
        } catch (error) {
            socket.emit(
                "error",
                apiResponse.error(false, error.message, currentRoute, error)
            );
        }
    },
    async getDataById(data, socket, io, currentRoute) {
        try {
            const { id } = data;
            if (!id && id < 1) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.idNull, currentRoute)
                })
            }
            let resultById = await RetailShopDepartmentModal.findOne({
                where: {
                    id: id
                }
            });
            if (!resultById) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Data" + customMessage.notFound, currentRoute)
                })
            }
            resultById = jsonFormator(resultById);
            return socket.emit(currentRoute, {
                ...apiResponse.success(true, "Data" + customMessage.fetched, currentRoute, resultById)
            })
        } catch (error) {
            return socket.emit(
                "error",
                apiResponse.error(false, error.message, currentRoute, error)
            );
        }
    },
    async getAllData(data, socket, io, currentRoute) {
        try {
            let resultById = await VKRetailShopDepartmentModal.findAll({
                where: {
                    RetailId: socket.user.id
                },
                order: [["created_on", "DESC"]]
            });
            if (!resultById) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Data" + customMessage.notFound, currentRoute)
                })
            }
            resultById = jsonFormator(resultById);
            return socket.emit(currentRoute, {
                ...apiResponse.success(true, "Data" + customMessage.fetched, currentRoute, resultById)
            })
        } catch (error) {
            return socket.emit(
                "error",
                apiResponse.error(false, error.message, currentRoute, error)
            );
        }
    },
    async updateRetailData(data, socket, io, currentRoute) {
        try {
            console.log("amit ????", data)
            const { id } = data;
            if (!id) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.idNull, currentRoute)
                })
            }
            const transaction = await sequelize.transaction();
            // Update Retail data 
            let resultById = await RetailShopDepartmentModal.update({
                status: 0,
                updated_by: socket.user.id
            }, {
                where: {
                    id: id
                }, transaction
            });
            if (!resultById) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Data" + customMessage.notFound, currentRoute)
                })
            }
            // after update find reatil shop data for create update table with new updated data
            let getDetailed = await RetailShopDepartmentModal.findOne({
                where: {
                    id: id
                }, transaction
            })
            if (!getDetailed) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Data" + customMessage.notFound, currentRoute)
                })
            }
            const details = jsonFormator(getDetailed)
            delete details.id;
            // create retail update tablle
            const cloneTbleCreate = await RetailShopDepartmentUpdateModal.create({
                ...details,
                ref_table_id: id,
                created_by: socket.user.id,
                activity: "Update",
            }, { transaction })
            if (!cloneTbleCreate) {
                throw new Error("error while inserting ");
            }
            // After update reatil update table then update status in distribution department modal table
            const updateDistribution = await DistributionCenterDepartmentModal.update({
                status: 0,
                updated_by: socket.user.id
            }, {
                where: {
                    retail_table_ref_id: id
                }, transaction
            });
            if (!updateDistribution) {
                throw new Error("error while inserting ");
            }
            // get new updated data from  distribution department table for update distribution update table
            let distDepartmentData = await DistributionCenterDepartmentModal.findOne({
                where: {
                    retail_table_ref_id: id
                }, transaction
            });
            if (!distDepartmentData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Data" + customMessage.notFound, currentRoute)
                })
            }
            const distDetails = jsonFormator(distDepartmentData);
            const distId = distDetails.id
            delete distDetails.id
            // create a new entry in  distribution update table
            const updateCloneDistCenter = await DistributionCenterDepartmentUpdateModal.create({
                ...distDetails,
                ref_table_id: distId,
                activity: "Update"
            }, { transaction })
            if (!updateCloneDistCenter) {
                throw new Error("error while inserting ");
            }
            // complete proccess 
            await transaction.commit();
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "Entry" + customMessage.delSucc, currentRoute)
            });
            return this.getAllData(data, socket, io, "retail-dpt:all");
        } catch (error) {
            console.log("Error =>", error)
            return socket.emit(
                "error",
                apiResponse.error(false, error.message, currentRoute, error)
            );
        }
    },

    //  Accept stock come from  distributin center
    async acceptStock(data, socket, io, currentRoute) {
        try {

            const { id } = await idSchema.validate(data);
            // get RetailShop Data
            let retailShopData = await RetailShopDepartmentModal.findOne({
                where: {
                    id: id
                }
            })
            if (!retailShopData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Data" + customMessage.notFound, currentRoute)
                })
            }

            const { retail_user_id: retailUserId, distributed_quantity: distributeQTY, entry_type_id: entryType, product_id: productId, ms_product_type_id: productType,
                master_packing_size_id: packingSize, quantity: quantity, weight_per_unit: weight, priceper_unit: pricePerUnit, department_id: departmentId,
                distribution_center_id: distCenterId } = jsonFormator(retailShopData);

            // check if stock is already distributed
            if (Number(quantity) === Number(distributeQTY)) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Stock is already Accepted",
                        currentRoute
                    ),
                });
            }
            let unit_Id = await ProductModel.findByPk(productId)
            if (!unit_Id) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Product not found!!", currentRoute)
                })
            }
            const { uom: unitId } = jsonFormator(unit_Id)
            // get distribution center stock from master stock table --------
            const checkAvlQty = await MasterStockModel.findOne({
                where: {
                    master_department_id: departmentId,
                    product_id: productId,
                    distribution_center_id: distCenterId,
                    master_packing_size_id: packingSize,
                }
            });
            if (!checkAvlQty) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.notFound, currentRoute)
                })
            }
            const { hold_quantity, id: disStockId } = jsonFormator(checkAvlQty)
            // if already some stock in hold then --------
            const totalHoldQty = hold_quantity - Number(quantity)
            const transaction = await sequelize.transaction();
            //   check wether sockspace is exists
            let stockSpaceDetails = await MasterStockModel.findOne({
                where: {
                    master_department_id: 7,
                    master_packing_size_id: packingSize ?? 0,
                    ms_product_type_id: productType,
                    product_id: productId,
                    status: 1,
                    unit_id: unitId,
                    retail_shop_id: retailUserId,
                    created_by: socket?.user?.id,
                },
                transaction,
            });
            let isNewStockSpaceCreated = false;
            // if stock space is not exits then create
            if (!stockSpaceDetails) {
                // create stock space
                const newStockSpace = await MasterStockModel.create({
                    master_department_id: 7,
                    master_packing_size_id: packingSize,
                    product_id: productId,
                    ms_product_type_id: productType,
                    available_qty: 0,
                    status: 1,
                    unit_id: unitId,
                    retail_shop_id: retailUserId,
                    created_by: socket?.user?.id,
                }, { transaction });
                //   stoc;
                console.log("newStockSpace created  =>", newStockSpace);
                isNewStockSpaceCreated = true;
            }
            if (isNewStockSpaceCreated) {
                stockSpaceDetails = await MasterStockModel.findOne({
                    where: {
                        master_department_id: 7,
                        master_packing_size_id: packingSize,
                        ms_product_type_id: productType,
                        product_id: productId,
                        status: 1,
                        unit_id: unitId,
                        retail_shop_id: retailUserId,
                        created_by: socket?.user?.id,
                    },
                    transaction,
                });
                console.log("stockSpaceDetails after creation =>", stockSpaceDetails);
            }
            const { available_qty: previousQty } = jsonFormator(stockSpaceDetails);
            // get packing size detail by packing size id
            const currentQty = Number(previousQty) + Number(quantity);
            //  insert stock in stock space
            const [insertResult] = await MasterStockModel.update(
                {
                    available_qty: sequelize.literal(
                        `available_qty + ${Number(quantity)}`,
                    ),
                },
                {
                    where: {
                        master_department_id: 7,
                        master_packing_size_id: packingSize,
                        ms_product_type_id: productType,
                        product_id: productId,
                        status: 1,
                        unit_id: unitId,
                        retail_shop_id: retailUserId,
                        updated_by: socket?.user?.id,
                    },
                    transaction,
                }
            );
            if (!insertResult) {
                console.error("insert result in stock space =>", insertResult)
                throw new Error("error while updating quantity in stock space");
            }
            const insertInStockInfoResult = await StockInfoModel.create(
                {
                    department_id: 7,
                    retail_shop_id: retailUserId,
                    dpt_table_ref_id: id,
                    product_id: productId,
                    product_type: productType,
                    weight_per_unit: weight,
                    master_stock_id: stockSpaceDetails?.id,
                    trns_type: "in",
                    master_packing_size_id: packingSize,
                    price_per_unit: pricePerUnit,
                    total_price: Number(pricePerUnit * quantity),
                    previous_stock: previousQty,
                    current_stock: currentQty,
                    quantity: quantity,
                    distribution_center_id: distCenterId,
                    created_by: socket?.user?.id,
                    status: true,
                },
                transaction
            );
            if (!insertInStockInfoResult) {
                throw new Error("error while inserting entry in stock info table");
            }
            let updateReatilShop = await RetailShopDepartmentModal.update({
                distributed_quantity: quantity,
                quantity: quantity,
                updated_by: socket.user.id
            }, {
                where: {
                    id: id
                }, transaction
            });
            if (!updateReatilShop) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Quantity" + customMessage.updErr, currentRoute)
                })
            }
            const cloneRetailUpdatetbl = await RetailShopDepartmentUpdateModal.create({
                retail_user_id: retailUserId,
                entry_type_id: entryType,
                product_id: productId,
                ms_product_type_id: productType,
                master_packing_size_id: packingSize,
                quantity: quantity,
                priceper_unit: 0,
                bill_image: null,
                weight_per_unit: weight,
                department_id: departmentId,
                distribution_center_id: distCenterId,
                created_by: socket.user.id,
                ref_table_id: id
            });
            if (!cloneRetailUpdatetbl) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Retail Update" + customMessage.creaErr, currentRoute)
                })
            }
            // update distribution department stock in master stock table ---------
            let updateDistributionStock = await MasterStockModel.update({
                hold_quantity: totalHoldQty,
                updated_by: socket.user.id
            }, { where: { id: disStockId }, transaction })
            if (!updateDistributionStock) {
                throw new Error("Error while updating distribution center stock in master stock table")
            }
            // // create same entry in stcok info table 
            /*   let stockInfoDist = await StockInfoModel({
                   department_id: departmentId,
                   retail_shop_id: retailUserId,
                   dpt_table_ref_id: id,
                   product_id: productId,
                   weight_per_unit: weight,
                   master_stock_id: stockSpaceDetails?.id,
                   trns_type: "in",
                   master_packing_size_id: packingSize,
                   price_per_unit: pricePerUnit,
                   total_price: Number(pricePerUnit * quantity),
                   previous_stock: previousQty,
                   current_stock: currentQty,
                   quantity: quantity,
                   distribution_center_id: distCenterId,
                   created_by: socket?.user?.id,
                   status: true,
               })*/
            await transaction.commit();
            return socket.emit(currentRoute, {
                ...apiResponse.success(true, "Ratail Stock" + customMessage.creaSucc, currentRoute)
            })
        } catch (error) {
            return socket.emit(
                "error",
                apiResponse.error(false, error.message, currentRoute, error)
            );
        }
    },

    //Return stock from retail shop to distrubution center department  

    async returnStock(data, socket, io, currentRoute) {
        try {
            forReturnStockSchema;
            const { productId, quantity, masterPckSizeUnit, message,
            } = await forReturnStockSchema.validate({ ...data, masterPckSizeUnit: data.packingSizeId }, {
                abortEarly: true,
                stripUnknown: true,
            });
            const currentTime = moment();
            const fiveMinutesAgo = moment().subtract(5, 'minutes');
            // get ms_product_type_id and unit_id from Master_Packing_Size
            let msPackSizeData = await MasterPackingSizeModel.findByPk(masterPckSizeUnit)
            if (!msPackSizeData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Packing Size" + customMessage.notFound, currentRoute, '')
                })
            }
            const { unit_id: unitId, weight: weight, mrp: mrp, ms_product_type_id: msProductTypeId } = jsonFormator(msPackSizeData)
            let isDataAlreadyAdd = await RetailShopDepartmentModal.findOne({
                where: {
                    entry_type_id: 5,
                    product_id: productId,
                    quantity: quantity,
                    created_on: {
                        [Op.between]: [fiveMinutesAgo.toDate(), currentTime.toDate()]
                    }
                }
            })
            if (isDataAlreadyAdd) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.dup, currentRoute)
                })
            }
            // check retail shop department stock availability
            const checkAvlQty = await MasterStockModel.findOne({
                where: {
                    master_department_id: 7,
                    product_id: productId,
                    retail_shop_id: socket.user.id,
                    master_packing_size_id: masterPckSizeUnit
                }
            });
            if (!checkAvlQty) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Insufficient stock", currentRoute)
                })
            }
            const { available_qty, id: rowId } = jsonFormator(checkAvlQty)
            const checkQty = available_qty > quantity;
            const remainingQty = parseInt(available_qty) - parseInt(quantity);
            if (!checkQty) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Stock cannot be returned above the available quantity.", currentRoute)
                })
            }

            const transaction = await sequelize.transaction();

            try {
                // create entry in retailshop department
                let addReturnEntry = await RetailShopDepartmentModal.create({
                    retail_user_id: socket.user.id,
                    entry_type_id: 5,
                    product_id: productId,
                    ms_product_type_id: msProductTypeId,
                    message_val: message,
                    master_packing_size_id: masterPckSizeUnit,
                    quantity: quantity,
                    priceper_unit: 0,
                    bill_image: null,
                    weight_per_unit: weight,
                    department_id: 6,
                    distribution_center_id: socket.user.distribution_center_id,
                    created_by: socket.user.id
                }, { transaction });
                if (!addReturnEntry) {
                    throw new Error("Error while creating retailshop department")
                }
                addReturnEntry = jsonFormator(addReturnEntry);
                const EntryId = addReturnEntry.id;
                delete addReturnEntry.id
                //  add same entry in retailshop update department
                let cloneRetailShop = await RetailShopDepartmentUpdateModal.create({
                    ...addReturnEntry,
                    ref_table_id: EntryId,
                    activity: "New",
                }, { transaction });
                if (!cloneRetailShop) {
                    throw new Error("Error while creating Retailshop department update")
                }
                // create new entry in stock info table
                let stockInfoEntry = await StockInfoModel.create({
                    master_stock_id: rowId,
                    department_id: 7,
                    dpt_table_ref_id: EntryId,
                    product_id: productId,
                    weight_per_unit: weight,
                    quantity: quantity,
                    hold_quantity: quantity,
                    trns_type: "return-req",
                    product_type: msProductTypeId,
                    master_packing_size_id: masterPckSizeUnit,
                    price_per_unit: mrp,
                    trans_remark: message,
                    current_stock: available_qty,
                    distribution_center_id: socket.user.distribution_center_id,
                    retail_shop_id: socket.user.retail_shop_id,
                    created_by: socket.user.id
                }, { transaction });
                if (!stockInfoEntry) {
                    throw new Error("Error in creating  entry in stock-info table =>")
                }
                // update reatil stock in master stock table
                let updateMasterTble = await MasterStockModel.update({
                    available_qty: remainingQty,
                    hold_quantity: quantity,
                    updated_by: socket.user.id
                }, { where: { id: rowId }, transaction });
                if (!updateMasterTble) {
                    throw new Error("Error in updating in  master-stock table =>")
                }
                //add same entry in distribution center 
                let addInDistribution = await DistributionCenterDepartmentModal.create({
                    retail_table_ref_id: EntryId,
                    entry_type_id: 5,
                    master_packing_size_id: masterPckSizeUnit,
                    product_id: productId,
                    ms_product_type_id: msProductTypeId,
                    quantity: quantity,
                    priceper_unit: 0,
                    unit_id: unitId,
                    dist_center_id: socket.user.distribution_center_id,
                    department_id: 7,
                    departmenthead_id: socket.user.id,
                    db_table_name: "RetailShop_Department",
                    db_table_id: EntryId,
                    message_val: message,
                    created_by: socket.user.id
                });
                if (!addInDistribution) {
                    throw new Error("Error while creating Distribution Department table")
                }
                addInDistribution = jsonFormator(addInDistribution);
                const distRowId = addInDistribution.id;
                delete addInDistribution.id
                //add clone entry in distribution center update table
                let cloneCreateDistUpdate = await DistributionCenterDepartmentUpdateModal.create({
                    ...addInDistribution,
                    ref_table_id: distRowId,
                    activity: "new"
                });
                if (!cloneCreateDistUpdate) {
                    throw new Error("Error while creating distribution center department update table ")
                }
                await transaction.commit();
                return socket.emit(currentRoute, { ...apiResponse.success(true, "Return Item Successfully !!", currentRoute) })
            } catch (error) {
                console.log(error);
                await transaction.rollback();
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
        } catch (error) {
            return socket.emit("error", { ...apiResponse.error(false, error.message, currentRoute, error) })
        }
    }
}
export default retailShopController;
