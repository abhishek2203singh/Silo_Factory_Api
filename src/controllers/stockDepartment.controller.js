import { customMessage } from "../utility/messages.util.js";
import { apiResponse } from "../utility/response.util.js";
import Yup from "yup";
import { jsonFormator } from "../utility/toJson.util.js";
import { StockDepartmentModel } from "../model/stockDepartment.model.js";
import { sequelize } from "../config/dbConfig.js";
import { StockDepartmentUpdateModel } from "../model/stockDepartmentUpdate.model.js";
import commonControllers from "./common.controller.js";
import { departmentEntrySchema } from "../yup-schemas/departmentEntry.schema.js";
import { changeDetector } from "../utility/changeDetector.util.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
import { StockDepartmentView } from "../model/views/stockDepartmentView.model.js";
import { MasterStockModel } from "../model/masterStock.model.js";
import { StockInfoModel } from "../model/stockInfo.model.js";
import { MasterPackingSizeModel } from "../model/masterPackingSize.model.js";
import { ProductModel } from "../model/product.model.js";
import { transferStockQtySchema } from "../yup-schemas/distributeStockQty.schema.js";
import { MasterDistributionCentersModel } from "../model/masterDistributionCenter.model.js";
import { forReturnStockSchema } from "../yup-schemas/stockReturn.schema.js";
import { DistributionCenterDepartmentModal } from "../model/distributionCenter.modal.js";
import { DistributionCenterDepartmentUpdateModal } from "../model/distributionCenterDepartmentUpdate.modal.js";
import { MasterEntryTypeModel } from "../model/masterEntryType.model.js";


const stockDepartmentControllers = {
    async addNewEntry(data = {}, socket, io, currentRoute) {
        try {
            const {
                entryType,
                productId,
                quantity,
                unitId,
                departmentId,
                departmentHead,
                packingSizeId,
                productTypeId,
            } = await departmentEntrySchema.validate(data, {
                abortEarly: true,
                stripUnknown: true,
            });

            // 
            const entryName = jsonFormator(await MasterEntryTypeModel.findByPk(entryType))?.name;
            console.log("entry name =>", entryName);

            if (entryType !== 2) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.useAnother + ` ${entryName}`) })
            }

            let departmentDetails = await MasterDepartmentModel.findByPk(
                departmentId
            );
            // in case depatment does not exists
            if (!departmentDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Destination Department" + customMessage.notEx,
                        currentRoute,
                        ""
                    ),
                });
            }
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
                        "Product" + customMessage.notEx + " or disabled",
                        currentRoute,
                        ""
                    ),
                });
            }
            // const { unitId } = productDetails;
            // check if  department exists
            const { table_name } = jsonFormator(departmentDetails);
            let nextId = await StockDepartmentModel.max("id");
            nextId = nextId == null ? 1 : nextId + 1;
            //   check wether entry already exists
            //   const startOfDay = moment().startOf("day");
            //   const endOfDay = moment().endOf("day");
            //   const isExists = await StockDepartmentModel.findOne({
            //     where: {
            //       entry_type_id: entryType,
            //       product_id: productId,
            //       unit_id: unitId,
            //       quantity: quantity,
            //       date: {
            //         [Op.between]: [startOfDay, endOfDay],
            //       },
            //       db_table_name: table_name,
            //     },
            //   });
            //   //   in case of duplicate entry
            //   if (isExists) {
            //     return socket.emit(currentRoute, {
            //       success: false,
            //       message: customMessage.dup,
            //       currentRoute,
            //     });
            //   }
            const transaction = await sequelize.transaction();
            try {
                // insert data in stock-department table
                let insertResult = await StockDepartmentModel.create(
                    {
                        entry_type_id: entryType,
                        product_id: productId,
                        unit_id: packingSizeId ? 5 : unitId,//if packing size is selected then unit will be pcs else according to selected unit
                        quantity: quantity,
                        department_id: departmentId, // id of destination department
                        departmenthead_id: departmentHead, // id of destination department head
                        db_table_name: table_name,
                        ms_product_type_id: productTypeId,
                        master_packing_size_id: packingSizeId,
                        db_table_id: nextId,
                        created_by: socket.user.id,
                    },
                    { transaction }
                );
                if (!insertResult) {
                    throw new Error("error while inserting ");
                }
                insertResult = jsonFormator(insertResult);

                // inserted id of stock_departement table
                const insertId = insertResult.id;
                delete insertResult.id;

                //   if entry inserted sucessfully in stock-department then also insert in (Stock-department_update) table
                const secondInsertResult = await StockDepartmentUpdateModel.create(
                    {
                        ...insertResult,
                        ref_table_id: insertId,
                        activity: "New",
                    },
                    { transaction }
                );
                if (!secondInsertResult) {
                    throw new Error(
                        "Error in creating second entry in pasteurization-department_update table =>"
                    );
                }
                const details = {
                    product_id: productId,
                    quantity: quantity,
                    unit_id: unitId,
                    pricePerUnit: 0,
                    db_table_name: "Stock_Department",
                    send_db_table_name: table_name,
                    db_table_id: insertId,
                    in_departmenthead_id: socket.user.id,
                    in_department_id: socket.user.department_id,
                    send_department_id: departmentId,
                    send_departmenthead_id: departmentHead,
                    entry_type_id: insertResult?.entry_type_id,
                    ms_product_type_id: productTypeId,
                    master_packing_size_id: packingSizeId,
                    bill_image: null,
                    created_by: socket.user.id,
                };
                const insertInAdminApproval =
                    await commonControllers.insertApprovalForManagerAdmin(
                        details,
                        transaction,
                        socket,
                        io,
                        currentRoute
                    );
                //   TODO: add notifications for all
                if (!insertInAdminApproval) {
                    throw new Error("error while inserting ");
                }
                await transaction.commit();
                socket.emit(currentRoute, {
                    ...apiResponse.success(
                        true,
                        "Entry added successfully",
                        currentRoute
                    ),
                });
                return this.getAllEntries(data, socket, io, "stock-dpt:all");
            } catch (error) {
                console.error("ERROR  while inserting =>", error);
                await transaction.rollback();
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
            //   insert the same data in
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
    async updateEntry(data, socket, io, currentRoute) {
        try {
            const updateSchema = departmentEntrySchema.concat(idSchema);
            const {
                entryType,
                productId,
                packingSizeId,
                quantity,
                unitId,
                departmentId,
                departmentHead,
                id,
            } = await updateSchema.validate(data);

            let departmentDetails = await MasterDepartmentModel.findByPk(
                departmentId
            );

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
            // const { unitId } = productDetails;
            //   if department not exits
            if (!departmentDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Department " + customMessage.notEx,
                        currentRoute,
                        ""
                    ),
                });
            }
            // get table name of department from department details
            const { table_name } = jsonFormator(departmentDetails);
            //    get entry data by id
            let isExists = await StockDepartmentModel.findByPk(id, {
                attributes: [
                    "entry_type_id",
                    "product_id",
                    "unit_id",
                    "quantity",
                    "department_id",
                    "departmenthead_id",
                    "db_table_name",
                ],
            });
            //   in case entry not exist against given id
            if (!isExists) {
                return socket.emit(currentRoute, {
                    success: false,
                    message: customMessage.notFound,
                    currentRoute,
                });
            }

            isExists = jsonFormator(isExists);

            // check wither if anything is changed
            const change = {
                entry_type_id: entryType,
                product_id: productId,
                unit_id: packingSizeId ? 5 : unitId,//if packing size is selected then unit will be pcs else according to selected unit
                quantity: Number(quantity),
                department_id: departmentId,
                departmenthead_id: departmentHead,
                db_table_name: table_name,
            };

            //   convert quantity in float
            isExists.quantity = parseFloat(isExists.quantity);

            //   check is there any defferecne between existing and new data
            const hasChanges = changeDetector(isExists, change);

            //   in case existing and new data are same
            if (!hasChanges) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.noChange, currentRoute),
                });
            }

            // transaction start *********************************************
            const transaction = await sequelize.transaction();

            try {
                // update in stock_department table

                const [upadateResult] = await StockDepartmentModel.update(
                    {
                        entry_type_id: entryType,
                        product_id: productId,
                        unit_id: unitId,
                        master_packing_size_id: packingSizeId,
                        quantity: parseFloat(quantity).toFixed(2),
                        department_id: departmentId,
                        departmenthead_id: departmentHead,
                        db_table_name: table_name,
                        db_table_id: id,
                        updated_by: socket.user.id,
                        updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                    },
                    {
                        where: {
                            id,
                        },
                        transaction,
                    }
                );
                if (!upadateResult) {
                    throw new Error("error while updating ");
                }
                let afterUpdateGetStockData = await StockDepartmentModel.findOne({
                    where: { id: id }
                });
                const formatData = jsonFormator(afterUpdateGetStockData)
                // insert he same new entry in stocke_department_update table
                const secondInsertResult = await StockDepartmentUpdateModel.create(
                    {
                        entry_type_id: entryType,
                        ref_table_id: id,
                        product_id: productId,
                        unit_id: unitId,
                        quantity: quantity,
                        ms_product_type_id: formatData.ms_product_type_id,
                        master_packing_size_id: packingSizeId,
                        department_id: departmentId,
                        departmenthead_id: departmentHead,
                        date: Date.now(),
                        db_table_name: table_name,
                        db_table_id: id,
                        created_by: socket.user.id,
                        activity: "update",
                        // pasteurization_department_id: insertId,
                    },
                    { transaction }
                );
                //   insert entry in update table
                if (!secondInsertResult) {
                    throw new Error(
                        "Error in creating second entry in stock_department_update table =>"
                    );
                }
                const details = {
                    product_id: productId,
                    quantity: quantity,
                    unit_id: unitId,
                    pricePerUnit: 0,
                    db_table_name: "Stock_Department", // name of current department table
                    send_db_table_name: table_name,
                    packingSizeId: packingSizeId,
                    db_table_id: id,
                    in_departmenthead_id: socket.user.id,
                    in_department_id: socket.user.department_id,
                    send_department_id: departmentId,
                    send_departmenthead_id: departmentHead,
                    entry_type_id: entryType,
                    bill_image: null,
                    created_by: socket.user.id,
                };
                // update data in admin  table
                const updated = await commonControllers.updateApprovalForManagerAdmin(
                    details,
                    transaction,
                    "Stock_Department",
                    id,
                    socket,
                    io,
                    currentRoute
                );
                //   TODO: add notifications for all
                if (!updated) {
                    throw new Error("Error in updateApprovalForManagerAdmin ");
                }
                // complet transaction in case of every thing is ok
                await transaction.commit();
                socket.emit(currentRoute, {
                    ...apiResponse.success(true, customMessage.updSucc, currentRoute),
                });
                return this.getAllEntries({}, socket, io, "stock-dpt:all");
            } catch (error) {
                console.error("ERROR  while inserting =>", error);
                await transaction.rollback();
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
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
    async getEntryById(data, socket, io, currentRoute) {
        try {
            // get user id from data
            const { id } = await idSchema.validate(data);

            let stockdprtResult = await StockDepartmentModel.findOne({
                where: { id: id },
            });

            if (!stockdprtResult) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Data " + customMessage.notFound, currentRoute) })
            }

            stockdprtResult = jsonFormator(stockdprtResult);
            //   if user not exists
            if (!stockdprtResult) {
                return socket.emit(
                    currentRoute,
                    ...apiResponse.error(false, "Stock Deprt not found !", currentRoute)
                );
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Stock department fetched ",
                    currentRoute,
                    stockdprtResult
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
    async deleteEntry(data, socket, io, currentRoute) {
        try {
            const { id } = await idSchema.validate(data);
            if (!id) {
                socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute, []),
                });
                return;
            }
            // Find the record by ID
            let record = await StockDepartmentModel.findOne({
                where: { id, status: true },
            });
            if (!record) {
                socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Entry " + customMessage.notEx,
                        currentRoute,
                        []
                    ),
                });
                return;
            }
            const oldRecord = record;
            record = jsonFormator(record);
            if (record.approval_status_id == 3) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        customMessage.approvedCantDelete,
                        currentRoute,
                        []
                    ),
                });
            }

            const transaction = await sequelize.transaction();

            try {
                // Assuming you're fetching the `record` instance before this code
                const record = await StockDepartmentModel.findOne({ where: { id: id }, transaction });

                if (!record) {
                    throw new Error('Record not found');
                }

                // Perform the soft delete by updating the status to 0
                await oldRecord.update({ status: 0 }, { transaction });
                let data = await oldRecord.save({ transaction });
                data = jsonFormator(data);

                if (data.status) {
                    throw new Error('Failed to change status to 0');
                }

                const refrenceId = data.id;
                delete data.id;

                const insertResult = await StockDepartmentUpdateModel.create(
                    {
                        ...data,
                        ref_table_id: refrenceId,
                        payment_status_by: data.payment_status_to_vendor,
                        activity: 'delete',
                        created_by: socket.user.id,
                    },
                    { transaction }
                );

                if (!insertResult) {
                    throw new Error('Failed to insert in update table');
                }

                await transaction.commit();

                socket.emit(currentRoute, {
                    ...apiResponse.success(true, customMessage.delSucc, currentRoute),
                });
                return this.getAllEntries(data, socket, io, "stock-dpt:all");
            } catch (error) {
                console.error('Error during deletion:', error);
                await transaction.rollback();
                socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
            //   socket.emit(currentRoute, {
            //     ...apiResponse.success(true, customMessage.delSucc, currentRoute, {
            //       id,
            //     }),
            //   });
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
            socket.emit("error", {
                ...apiResponse.error(
                    false,
                    error.messagge,
                    currentRoute,
                    error.message
                ),
            });
        }
    },
    async getAllEntries(data, socket, io, currentRoute) {
        try {
            const { id } = data
            let allEntries
            if (id) {
                allEntries = await StockDepartmentView.findOne({
                    where: {
                        sdId: id
                    }
                })
            } else {
                allEntries = await StockDepartmentView.findAll({

                    order: [["created_on", "DESC"]],
                });
            }

            jsonFormator(allEntries);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    customMessage.fetchedcurrentRoute,
                    currentRoute,
                    allEntries
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getEntriesByEntryTypeId(data, socket, io, currentRoute) {
        try {
            let allEntries = await StockDepartmentView.findAll({
                where: {
                    EntryId: 4
                },
                order: [["created_on", "DESC"]]
            })
            jsonFormator(allEntries);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    customMessage.fetchedcurrentRoute,
                    currentRoute,
                    allEntries
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    // to send stock to distribution center 
    async forDistributeQty(data, socket, io, currentRoute) {
        try {
            // transferStockQtySchema;
            // console.table(data)

            // if current logged in user is not belongs to stock department
            if (socket.user.department_id !== 2) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "You are not authorized to perform this action!!", currentRoute, '')
                })
            }
            const { id, dispatchedStockQty, sellingPrice, trnsMessage } =
                await transferStockQtySchema.validate(data, {
                    abortEarly: true,
                    stripUnknown: true,
                });
            // get Stock data by id
            let stockData = await StockDepartmentModel.findByPk(id);
            // console.log("stock data =>", stockData);
            if (!stockData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Stock Data" + customMessage.notEx, currentRoute, '')
                })
            }

            const { product_id: productId, quantity: quantity, department_id: departmentId, departmenthead_id: departmentHead, distributed_quantity, master_packing_size_id: packingSizeId, dist_center_id } = jsonFormator(stockData)
            if (distributed_quantity > 0) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, `this request is already processed with the quantity : ${distributed_quantity}`, currentRoute, '')
                })
            }
            // get details of requested product 
            let productDetails = await ProductModel.findByPk(productId);
            if (!productDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, " selectd Product " + customMessage.notEx, currentRoute, '')
                })
            }
            productDetails = jsonFormator(productDetails);
            console.table(productDetails)
            // find department
            const checkDisptachedqty = dispatchedStockQty <= quantity;
            if (!checkDisptachedqty) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Dispatched Quantity is not greater than requested quantity!!", currentRoute, '')
                })
            }
            let departmentDetails = await MasterDepartmentModel.findByPk(
                departmentId
            );
            // in case depatment does not exists
            if (!departmentDetails) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Destination Department" + customMessage.notEx,
                        currentRoute,
                        ""
                    ),
                });
            }
            // check if  department exists
            const { table_name } = jsonFormator(departmentDetails);
            let nextId = await StockDepartmentModel.max("id");
            nextId = nextId == null ? 1 : nextId + 1;
            const transaction = await sequelize.transaction();
            // get packing unit weight and id
            let packingData = await MasterPackingSizeModel.findByPk(packingSizeId)
            if (!packingData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "Packing size" + customMessage.notEx,
                        currentRoute,
                        ""
                    ),
                });
            }
            const { weight } = jsonFormator(packingData);

            // get ms-product-type by using product id

            let msProductUnit = await ProductModel.findByPk(productId);
            const { ms_product_type_id, uom } = jsonFormator(msProductUnit)


            // find data form Master stock table for available_qty
            let checkAvailableQty = await MasterStockModel.findOne({
                where: {
                    product_id: productId,
                    master_packing_size_id: packingSizeId,
                    master_department_id: socket.user.department_id
                }
            });
            console.log("checkAvailableQty =>", checkAvailableQty)
            if (!checkAvailableQty) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, `insufficient stock of ' ${productDetails.product_name} '`, currentRoute, '')
                })
            }
            const { available_qty } = jsonFormator(checkAvailableQty);
            const masterTblId = checkAvailableQty.id
            // check if requested qty is grater than available qty
            const checkQty = available_qty > dispatchedStockQty
            if (!checkQty) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Stock is not available in the requested quantity.", currentRoute, '')
                })
            }
            const remainingQty = parseInt(available_qty) - parseInt(dispatchedStockQty);
            // update Master stock table when send stock 
            let stockInfoUpdate = await MasterStockModel.update({
                available_qty: remainingQty,
                updated_by: socket.user.id
            }, {
                where: {
                    product_id: productId,
                    master_packing_size_id: packingSizeId,
                    master_department_id: 3
                }, transaction
            });
            if (!stockInfoUpdate) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Quantiy" + customMessage.cantModify, customMessage, '')
                })
            }
            // TODO: get stock table id and then create stock entry and table id = ref_table_id 
            let insertStockTbl = await StockDepartmentModel.create(
                {
                    entry_type_id: 4,
                    ref_table_id: id,
                    product_id: productId,
                    ms_product_type_id: ms_product_type_id,
                    distributed_quantity: dispatchedStockQty,
                    master_packing_size_id: packingSizeId,
                    quantity: dispatchedStockQty,
                    dist_center_id: stockData.dist_center_id,
                    unit_id: packingSizeId ? 5 : uom,//if packing size is exists then the unit will be pcs otherwise the unit of the product will be used
                    this_table_ref_id: id,
                    selling_price: sellingPrice,
                    department_id: departmentId, // id of destination department
                    departmenthead_id: departmentHead, // id of destination department head
                    db_table_name: table_name,
                    db_table_id: nextId,
                    created_by: socket.user.id,
                },
                { transaction }
            );
            if (!insertStockTbl) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.creaErr, currentRoute, '')
                })
            }
            insertStockTbl = jsonFormator(insertStockTbl)
            const insertId = insertStockTbl.id;
            delete insertStockTbl.id
            // add same entry in stock update table 
            const cloneinsertStockTbl = await StockDepartmentUpdateModel.create({
                ...insertStockTbl,
                ref_table_id: insertId,
                activity: "New",
            }, { transaction })
            if (!cloneinsertStockTbl) {
                throw new Error(
                    "Error in creating second entry in pasteurization-department_update table =>"
                );
            }
            // update distributed quantity in respective request type row

            const [updateDistributedQty] = await StockDepartmentModel.update({
                distributed_quantity: quantity
            }, {
                where: {
                    id
                }, transaction
            })
            if (!updateDistributedQty) {

                throw new Error(
                    "Error in updating distributed quantity in respective request type row =>"
                );
            }

            // add details in stock info table 
            const insertStockInfo = await StockInfoModel.create({
                department_id: departmentId,
                dpt_table_ref_id: id,
                product_id: productId,
                weight_per_unit: weight,
                master_packing_size_id: packingSizeId,
                master_stock_id: masterTblId,
                trns_type: "out",
                trans_remark: trnsMessage,
                dist_center_id,
                product_type: ms_product_type_id,
                quantity: dispatchedStockQty,
                price_per_unit: sellingPrice,
                previous_stock: available_qty,
                current_stock: remainingQty,
                created_by: socket.user.id,
            }, { transaction });
            if (!insertStockInfo) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Stock Info" + customMessage.creaErr, currentRoute, '')
                })
            }
            const details = {
                product_id: productId,
                quantity: dispatchedStockQty,
                unit_id: packingSizeId ? 5 : uom,
                pricePerUnit: sellingPrice,
                db_table_name: "Stock_Department",
                send_db_table_name: table_name,
                db_table_id: insertId,
                in_departmenthead_id: socket.user.id,
                in_department_id: socket.user.department_id,
                send_department_id: departmentId,
                send_departmenthead_id: departmentHead,
                dist_center_id,
                entry_type_id: 4,
                productTypeId: ms_product_type_id,
                packingSizeId,
                bill_image: null,
                created_by: socket.user.id,
            };

            const insertInAdminApproval =
                await commonControllers.insertApprovalForManagerAdmin(
                    details,
                    transaction,
                    socket,
                    io,
                    currentRoute
                );
            if (!insertInAdminApproval) {
                throw new Error("error while inserting ");
            }
            await transaction.commit();
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "Stock sent Successfully!!", currentRoute, '')
            });
            return this.getEntriesByEntryTypeId(data, socket, io, "stock-dpt:all-by-entryId");
        } catch (error) {
            return socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error)
            })
        }
    },
    // For accept return qty for distbution department-------
    async acceptReturnQty(data, socket, io, currentRoute) {
        try {
            const messageSchema = await forReturnStockSchema.pick(["message"]);
            const stockScema = idSchema.concat(messageSchema);
            const { id, message } = await stockScema.validate(data)
            let rowData = await StockDepartmentModel.findOne({
                where: { id: id }
            });
            if (!rowData) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Data" + customMessage.notFound, currentRoute) })
            }
            const { ms_product_type_id: productTypeId, quantity: quantity, distributed_quantity: distributeQty, product_id: productId, entry_type_id: entryId, departmenthead_id: departmentHeadId, master_packing_size_id: packingSizeId } = jsonFormator(rowData)
            // check if entry type not return
            if (entryId != 5) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.notAllowed, currentRoute) })
            }
            if (quantity === distributeQty) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Stock already accepted!!", currentRoute) })
            }
            // get ms_product_type_id and unit_id from Master_Packing_Size
            let msPackSizeData = await MasterPackingSizeModel.findByPk(packingSizeId)
            if (!msPackSizeData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Packing Size" + customMessage.notFound, currentRoute, '')
                })
            }
            const { weight: weight, mrp: mrp } = jsonFormator(msPackSizeData)
            // get distribution center Owner name -----
            let getDistCenterId = await MasterDistributionCentersModel.findOne({
                where: { manager_or_owner: departmentHeadId }
            });
            if (!getDistCenterId) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Distribution Center" + customMessage.notFound, currentRoute) })
            }
            const { id: distCenterId } = jsonFormator(getDistCenterId);
            let getMasterStockDataDistCenter = await MasterStockModel.findOne({
                where: {
                    master_department_id: 6,
                    product_id: productId,
                    distribution_center_id: distCenterId,
                    master_packing_size_id: packingSizeId
                }
            })
            if (!getMasterStockDataDistCenter) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Data" + customMessage.invalidReq, currentRoute)
                })
            }
            const { id: rowIdDist } = jsonFormator(getMasterStockDataDistCenter)
            // Get master table data according  to stock table ---------------
            let getMasterStockDataStock = await MasterStockModel.findOne({
                where: {
                    master_department_id: 2,
                    product_id: productId,
                    master_packing_size_id: packingSizeId
                }
            })
            if (!getMasterStockDataStock) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Stock Data" + customMessage.invalidReq, currentRoute)
                })
            }
            const { available_qty, id: stockRowId } = jsonFormator(getMasterStockDataStock)
            const totalgQty = parseInt(available_qty) + parseInt(quantity);

            const transaction = await sequelize.transaction();

            try {

                let updateStockTbl = await StockDepartmentModel.update({
                    distributed_quantity: quantity,
                    updated_by: socket.user.id
                }, { where: { id: id }, transaction })
                if (!updateStockTbl) {
                    throw new Error("Error in updating stock department table")
                }
                // add stock info when data come in stock table 
                let stockInfoEntry = await StockInfoModel.create({
                    master_stock_id: stockRowId,
                    department_id: 2,
                    dpt_table_ref_id: id,
                    product_id: productId,
                    weight_per_unit: weight,
                    quantity: quantity,
                    hold_quantity: 0,
                    trns_type: "IN",
                    product_type: productTypeId,
                    master_packing_size_id: packingSizeId,
                    price_per_unit: mrp,
                    trans_remark: message,
                    current_stock: available_qty,
                    created_by: socket.user.id
                }, { transaction });
                if (!stockInfoEntry) {
                    throw new Error("Error in creating  entry in stock-info table =>")
                }
                // add master stock when stock-department accept data
                let updateMasterTble = await MasterStockModel.update({
                    available_qty: totalgQty,
                    updated_by: socket.user.id
                }, { where: { id: stockRowId, }, transaction })
                if (!updateMasterTble) {
                    throw new Error("Error in updating in  master-stock table =>")
                }
                // create another entry in stock-info table for distribution table
                let createStockInfo = await StockInfoModel.create({
                    master_stock_id: rowIdDist,
                    department_id: 6,
                    dpt_table_ref_id: id,
                    product_id: productId,
                    weight_per_unit: weight,
                    quantity: quantity,
                    hold_quantity: 0,
                    trns_type: "OUT",
                    product_type: productTypeId,
                    master_packing_size_id: packingSizeId,
                    price_per_unit: mrp,
                    trans_remark: message,
                    current_stock: available_qty,
                    created_by: socket.user.id
                }, { transaction });
                if (!createStockInfo) {
                    throw new Error("Error while create stock -info table for distribution data")
                }
                // update master stock table for distribution table
                let updatesameinDistribution = await MasterStockModel.update({
                    hold_quantity: 0
                }, {
                    where: {
                        id: rowIdDist
                    }, transaction
                });
                if (!updatesameinDistribution) {
                    throw new Error("Error in while updateing master stock distribution data")
                }
                await transaction.commit();
                return socket.emit(currentRoute, { ...apiResponse.success(true, "Stock Accepted!!", currentRoute) })
            } catch (error) {
                console.log(error)
                await transaction.rollback();
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
                });
            }
        } catch (error) {
            return socket.emit("error", { ...apiResponse.error(false, error.message, currentRoute, error) })
        }
    },
    // For reject return qty for distbution department-------
    async rejectReturnQty(data, socket, io, currentRoute) {
        try {
            const messageSchema = await forReturnStockSchema.pick(["message"]);
            const stockScema = idSchema.concat(messageSchema);
            const { id, message } = await stockScema.validate(data)
            let rowData = await StockDepartmentModel.findOne({
                where: { id: id }
            });
            if (!rowData) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Data" + customMessage.notFound, currentRoute) })
            }
            const { ms_product_type_id: productTypeId, db_table_id: distTblId, quantity: quantity, product_id: productId, entry_type_id: entryId, departmenthead_id: departmentHeadId, master_packing_size_id: packingSizeId } = jsonFormator(rowData)
            if (entryId != 6) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.notAllowed, currentRoute) })
            }
            // get packing size id------------
            let msPackSizeData = await MasterPackingSizeModel.findByPk(packingSizeId)
            if (!msPackSizeData) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Packing Size" + customMessage.notFound, currentRoute, '')
                })
            }
            const { weight: weight, mrp: mrp } = jsonFormator(msPackSizeData)
            let getDistCenterId = await MasterDistributionCentersModel.findOne({
                where: { manager_or_owner: departmentHeadId }
            });
            if (!getDistCenterId) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "Distribution Center" + customMessage.notFound, currentRoute) })
            }
            const { id: distCenterId } = jsonFormator(getDistCenterId);
            let getMasterStockDataDistCenter = await MasterStockModel.findOne({
                where: {
                    master_department_id: 6,
                    product_id: productId,
                    distribution_center_id: distCenterId,
                    master_packing_size_id: packingSizeId
                }
            })
            if (!getMasterStockDataDistCenter) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Data" + customMessage.invalidReq, currentRoute)
                })
            }
            const { available_qty, hold_quantity, id: rowIdDist } = jsonFormator(getMasterStockDataDistCenter)
            const totalgQty = parseInt(available_qty) + parseInt(hold_quantity);
            const transaction = await sequelize.transaction();
            try {
                let stockInfo = await StockInfoModel.create({
                    master_stock_id: rowIdDist,
                    department_id: 6,
                    dpt_table_ref_id: id,
                    product_id: productId,
                    weight_per_unit: weight,
                    quantity: quantity,
                    hold_quantity: 0,
                    trns_type: "IN",
                    product_type: productTypeId,
                    master_packing_size_id: packingSizeId,
                    price_per_unit: mrp,
                    trans_remark: message,
                    current_stock: available_qty,
                    created_by: socket.user.id
                }, { transaction });
                if (!stockInfo) {
                    throw new Error("Error while create stock -info table for distribution data")
                }
                // update master stock table
                let msStockTble = await MasterStockModel.update({
                    hold_quantity: 0,
                    available_qty: totalgQty,
                    updated_by: socket.user.id
                }, { where: { id: rowIdDist }, transaction })
                if (!msStockTble) {
                    throw new Error("Error in while updateing master stock distribution data")
                }
                // now update distribution tbl entry type
                let updateDistributionTbl = await DistributionCenterDepartmentModal.update({
                    entry_type_id: 6,
                    updated_by: socket.user.id
                }, { where: { id: distTblId }, transaction });
                if (!updateDistributionTbl) {
                    throw new Error("Error while updating distribution table entry type")
                }
                // after update get distribution data
                let getDistributeData = await DistributionCenterDepartmentModal.findOne({
                    where: { id: distTblId }
                });
                if (!getDistributeData) {
                    throw new Error("Error while get data distribution data")
                }
                getDistributeData = jsonFormator(getDistributeData)
                const entryId = getDistributeData.id;
                delete getDistributeData.id;
                // then  create new tbl according to update distribution table
                let cloneDistributeTble = await DistributionCenterDepartmentUpdateModal.create({
                    ...getDistributeData,
                    ref_table_id: entryId,
                    activity: "update",
                    created_by: socket.user.id
                });
                if (!cloneDistributeTble) {
                    throw new Error("Error while create distribution update table")
                }
                await transaction.commit();
                socket.emit(currentRoute, { ...apiResponse.error(true, "Entry successfully rejected!!", currentRoute) })
                return this.getAllEntries(data, socket, io, "stock-dpt:all");
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
};

export default stockDepartmentControllers;
