/* eslint-disable no-unused-vars */
import Yup from "yup";
import { apiResponse } from "../utility/response.util.js";
import { customMessage } from "../utility/messages.util.js";
import { sequelize } from "../config/dbConfig.js";
import { StockDepartmentModel } from "../model/stockDepartment.model.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { MasterStockModel } from "../model/masterStock.model.js";
import { StockInfoModel } from "../model/stockInfo.model.js";
import { insertInStockSpaceSchema } from "../yup-schemas/insertInStockSpace.schema.js";
import { StockDepartmentUpdateModel } from "../model/stockDepartmentUpdate.model.js";
import stockDepartmentControllers from "./stockDepartment.controller.js";
import { stockUtil } from "../utility/stock.util.js";
import Sequelize from "sequelize";
import { ProductModel } from "../model/product.model.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
import { MasterPackingSizeModel } from "../model/masterPackingSize.model.js";
import { MasterDistributionCentersModel } from "../model/masterDistributionCenter.model.js";
import { MasterStockViewModel } from "../model/views/masterStockView.model.js";
import { StockInfoViewModel } from "../model/views/stockInfoView.model.js";
import { QualityApprovalManagerWithAdmin } from "../model/qualityApprovalMngAd.model.js";
import { BroadcastMethod } from "../Common/Broadcast.js";
import commonControllers from "./common.controller.js";
const stockInfoControllers = {
  // insert stock in stock spaces
  async insertInStock(data, socket, io, currentRoute) {
    const transaction = await sequelize.transaction();
    try {
      const { sourceId = false } = data;
      //   incase the source id is not privided (sourceId : the id of entry in respective department table in this case Stock_Department table )
      if (!sourceId) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      //   fetch details of the entry which is comes from other departments (e.g: product DPt , pastuerization DPT , packaging DPT)
      let stockDetail = await StockDepartmentModel.findByPk(sourceId);
      // if data is not found in respose to provided sourceId
      if (!stockDetail) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      stockDetail = jsonFormator(stockDetail);
      const {
        quantity: originalQuantity, //which is sended / will be recived by the respective department
        distributed_quantity: distibutedQty,
        approval_status_id,
      } = stockDetail;
      //   if stock is fully destibuted
      if (originalQuantity == distibutedQty) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            customMessage.stockDistributed,
            currentRoute
          ),
        });
      }
      //   if stock is not apprved
      if (approval_status_id != 3) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            customMessage.reqNotApproved,
            currentRoute
          ),
        });
      }

      const totalQtyToBeDistibuted = stockUtil.calTotalQuantity(data.entries);
      console.log("totalQtyToBeDistibuted => ", totalQtyToBeDistibuted);

      //   if totalQtyToBeDistibuted is greater than originalQuantity
      if (totalQtyToBeDistibuted > originalQuantity - distibutedQty) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Distribution quantity must not be greater than remaining/original quantity ${originalQuantity - distibutedQty
            }`,
            currentRoute
          ),
        });
      }
      //
      // Handle multiple entries
      if (Array.isArray(data.entries)) {
        for (const entry of data.entries) {
          const result = await this.processStockSpaceEntry(
            entry,
            socket,
            transaction,
            currentRoute,
            insertInStockSpaceSchema,
            sourceId
          );
          if (!result) {
            await transaction.rollback();
            return;
          }
        }
      } else {
        // Handle single entry data
        const result = await this.processStockSpaceEntry(
          data.entries,
          socket,
          transaction,
          currentRoute,
          insertInStockSpaceSchema,
          sourceId
        );
        if (!result) {
          await transaction.rollback();
          return;
        }
      }
      let [distributionUpdate] = await StockDepartmentModel.update(
        {
          distributed_quantity: sequelize.literal(
            `distributed_quantity + ${Number(totalQtyToBeDistibuted)}`
          ),
        },
        {
          where: {
            id: sourceId,
          },
          transaction,
        }
      );
      console.log(distributionUpdate);
      if (!distributionUpdate) {
        console.log("distributed quantity update => ", distributionUpdate);
        throw new Error("error while updating distibuted quantity");
      }
      delete stockDetail.id;
      console.log(stockDetail);
      // to insert the same entry in stock department update table
      const finalEntry = await StockDepartmentUpdateModel.create(
        {
          ...stockDetail,
          activity: "update",
          distributed_quantity: parseFloat(totalQtyToBeDistibuted).toFixed(2),
          created_by: socket?.user?.id,
          db_table_id: sourceId,
          db_table_name: "Silo_Department",
          ref_table_id: sourceId,
        },
        { transaction }
      );
      if (!finalEntry) {
        throw new Error("error while inserting entry in update table");
      }
      // Commit the transaction if all entries are processed successfully
      await transaction.commit();
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Distributed successfully ",
          currentRoute,
          totalQtyToBeDistibuted
        ),
      });
      stockDepartmentControllers.getEntryById(
        { id: sourceId },
        socket,
        io,
        "stock-dpt:get-data-by-id"
      );
    } catch (error) {
      await transaction.rollback(); // Rollback transaction in case of error
      console.error("ERROR =>>>>> :", error);
      socket.emit(currentRoute, {
        ...apiResponse.error(
          false,
          customMessage.wentWrong +
          " while adding stock If the problem persists, contact support",
          currentRoute
        ),
      });
    }
  },
  // global api to accept stock from any departmen
  async acceptStock(data, socket, io, currentRoute) {
    try {
      // id of entry
      const { id } = await idSchema.validate(data);
      // get distribution center details
      let distributionDetails = await MasterDistributionCentersModel.findOne({
        where: {
          manager_or_owner: socket.user.id,
        },
      });


      const { id: distributionCenterId } = distributionDetails
        ? jsonFormator(distributionDetails)
        : { id: 0 };


      console.log("distributionDetails :".distributionDetails);
      let Dist_id = null;
      if (distributionDetails) {
        Dist_id = distributionCenterId;
      }
      console.log("distributionCenterId =>", distributionCenterId);
      // get department details of current user
      const departmentDetails = await MasterDepartmentModel.findByPk(
        socket.user.department_id
      );

      console.log("Department detail =>", departmentDetails);

      const { table_name } = jsonFormator(departmentDetails);

      if (table_name?.length < 2) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.notAuth, currentRoute),
        });
      }
      console.log({
        dptId: socket.user.department_id,
        table_name,
      });
      // get entry detail by id
      let [[entryDetails]] = await sequelize.query(
        `SELECT * FROM ${table_name} WHERE id = ${id}`
      );
      console.log("entry details =>", entryDetails);
      const {
        master_packing_size_id,
        ms_product_type_id,
        distributed_quantity,
        product_id,
        department_id,
        quantity,
        entry_type_id,
      } = entryDetails;

      console.log("entryDetails =>", entryDetails);

      // the owner of the department only can accept the stock

      if (entryDetails?.department_id !== socket?.user?.department_id) {
        return socket.emit(currentRoute, { ...apiResponse.error(false, customMessage.notAuth, currentRoute) })
      }

      // fetch product details
      let productDetails = await ProductModel.findOne({
        where: {
          id: product_id,
          status: true,
        },
      });
      if (!productDetails) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "Invalid product", currentRoute),
        });
      }
      productDetails = jsonFormator(productDetails);
      console.log("entry details");
      console.table(entryDetails);
      // extra colum activity added
      entryDetails.activity = "Update";
      // console.log(entryDetails);
      if (!entryDetails) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      // check if stock is already distributed
      if (quantity === distributed_quantity) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Stock is already Accepted",
            currentRoute
          ),
        });
      }
      //   if entry is not type of stock in
      if (entry_type_id !== 3 && entry_type_id !== 7) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "invalid stock details", currentRoute),
        });
      }
      const transaction = await sequelize.transaction();
      try {
        //   check wether sockspace is exists
        let stockSpaceDetails = await MasterStockModel.findOne({
          where: {
            master_department_id: department_id,
            master_packing_size_id: master_packing_size_id ?? 0,
            ms_product_type_id,
            product_id,
            status: 1,
            unit_id: productDetails.uom,
            distribution_center_id: Dist_id ?? 0,
            retail_shop_id: Dist_id ?? 0,
            created_by: socket?.user?.id,
          },
          transaction,
        });

        console.log("isStockSpaceExists =>", stockSpaceDetails);

        //   in case the stock space was previously not exists then create;
        // by default assumes that the stock space is not already exists ;
        let isNewStockSpaceCreated = false;

        // if stock space is not exits then create
        if (!stockSpaceDetails) {
          // create stock space
          const newStockSpace = await MasterStockModel.create(
            {
              master_department_id: socket.user.department_id,
              master_packing_size_id: master_packing_size_id ?? 0,
              is_packed_product: master_packing_size_id ? true : false,
              ms_product_type_id,
              product_id,
              available_qty: 0,
              status: 1,
              unit_id: entryDetails.unit_id,
              distribution_center_id: Dist_id ?? 0,
              retail_shop_id: socket?.user?.retail_shop_id ?? 0,
              created_by: socket?.user?.id,
            },
            { transaction }
          );
          //   stoc;
          console.log("newStockSpace created  =>", newStockSpace);
          isNewStockSpaceCreated = true;
        }
        //   if stock space was initially not exists and now created new ()
        if (isNewStockSpaceCreated) {
          stockSpaceDetails = await MasterStockModel.findOne({
            where: {
              master_department_id: socket.user.department_id, //id of current department
              master_packing_size_id: master_packing_size_id ?? 0,
              ms_product_type_id,
              product_id,
              status: 1,
              unit_id: entryDetails.unit_id,
              distribution_center_id: Dist_id ?? 0,
              retail_shop_id: socket?.user?.retail_shop_id ?? 0,
              created_by: socket?.user?.id,
            },
            transaction,
          });
          console.log("stockSpaceDetails after creation =>", stockSpaceDetails);
        }
        // get packing size detail by packing size id
        const packingSizeDetails = await MasterPackingSizeModel.findByPk(
          master_packing_size_id
        );
        let weight = 0,
          mrp = 0;
        if (packingSizeDetails) {
          weight = jsonFormator(packingSizeDetails).weight;
        }
        const { available_qty: previousQty } = jsonFormator(stockSpaceDetails);
        console.log("previousQty  =>", previousQty);
        const currentQty = Number(previousQty) + Number(distributed_quantity);
        //  insert stock in stock space
        const [insertResult] = await MasterStockModel.update(
          {
            available_qty: sequelize.literal(
              `available_qty + ${Number(quantity)}`
            ),
          },
          {
            where: {
              master_department_id: socket.user.department_id,
              master_packing_size_id: master_packing_size_id ?? 0,
              ms_product_type_id,
              product_id,
              status: 1,
              unit_id: entryDetails.unit_id,
              distribution_center_id: Dist_id ?? 0,
              retail_shop_id: socket?.user?.retail_shop_id ?? 0,
              created_by: socket?.user?.id,
            },
            transaction,
          }
        );
        if (!insertResult) {
          console.error("insert result in stock space =>", insertResult);
          throw new Error("error while updating quantity in stock space");
        }

        if (!insertResult) {
          throw new Error("error while updating stock in stock space");
        }

        // insert in stock info table
        const insertInStockInfoResult = await StockInfoModel.create(
          {
            department_id: socket.user.department_id,
            dpt_table_ref_id: id,
            product_id,
            weight_per_unit: weight,
            master_stock_id: stockSpaceDetails?.id,
            trns_type: "in",
            master_packing_size_id: master_packing_size_id,
            price_per_unit: mrp,
            total_price: Number(mrp * quantity),
            previous_stock: previousQty,
            current_stock: currentQty,
            quantity,
            distribution_center_id: Dist_id ?? 0,
            retail_shop_id: socket?.user?.retail_shop_id ?? 0,
            created_by: socket?.user?.id,
            status: true,
          },
          transaction
        );
        if (!insertInStockInfoResult) {
          throw new Error("error while inserting entry in stock info table");
        }
        // update in distributed quqntity

        // if stockin is coming in stock department,

        let [updateDistibutedQantity] = await sequelize.query(
          `UPDATE  ${table_name} SET distributed_quantity = distributed_quantity + ${quantity} Where id=${id}`,
          { transaction }
        );
        console.log(
          "distributed quantity update result =>",
          updateDistibutedQantity
        );
        const [resultAfterUpdate] = await sequelize.query(
          `select * from ${table_name}  Where id=${id}`
        );
        console.log("quantity after update result =>", resultAfterUpdate);
        if (!updateDistibutedQantity) {
          throw new Error(
            "error while updating distributed quantity in stock department"
          );
        }
        // update in stock in coming in stock department
        if (table_name == "Stock_Department") {
          const [insertInStockDptUpdateTable] = await sequelize.query(
            `  INSERT INTO ${table_name}_Update (
    ref_table_id, entry_type_id, department_id, departmenthead_id, 
    approval_status_by_destination, activity, date, approval_datetime, 
    vendor_id, approval_by, approval_status_id, product_id, 
    master_packing_size_id, ms_product_type_id, bill_image, 
    selling_price, quantity, distributed_quantity, unit_id, db_table_name, 
    admin_table_id, db_table_id, with_approval, status, 
    created_by, created_on
  ) 
  VALUES 
  (
    :id, :entry_type_id, :department_id, :departmenthead_id, 
    :approval_status_by_destination,:activity, :date, :approval_datetime, 
    :vendor_id, :approval_by, :approval_status_id, :product_id, 
    :master_packing_size_id, :ms_product_type_id, :bill_image, 
    :selling_price, :quantity, ${quantity}, 
     :unit_id, :db_table_name, 
    :admin_table_id, :db_table_id, :with_approval, :status, 
    ${socket.user.id},CURRENT_TIMESTAMP() 
  )
`,
            { replacements: entryDetails, transaction }
          );
          if (!insertInStockDptUpdateTable) {
            throw new Error(
              "error while inserting entry in stock department update table"
            );
          }
          console.log("upadate table details =>", insertInStockDptUpdateTable);
          // Commit the transaction if all entries are processed successfully
          await transaction.commit();
          return socket.emit(currentRoute, {
            ...apiResponse.success(
              true,
              customMessage.stockAccepted,
              currentRoute
            ),
          });
        }
        // if stock is insereted in other department
        const [updateTableResult] = await sequelize.query(
          `  INSERT INTO ${table_name}_Update (
ref_table_id, entry_type_id, department_id, departmenthead_id, 
approval_status_by_destination, activity, date, approval_datetime, 
vendor_id, approval_by, approval_status_id, product_id, 
master_packing_size_id, ms_product_type_id, bill_image,  quantity, distributed_quantity, unit_id, db_table_name, 
admin_table_id, db_table_id, with_approval, status, 
created_by, created_on
) 
VALUES 
(
:id, :entry_type_id, :department_id, :departmenthead_id, 
:approval_status_by_destination,:activity, :date, :approval_datetime, 
:vendor_id, :approval_by, :approval_status_id, :product_id, 
:master_packing_size_id, :ms_product_type_id, :bill_image, 
 :quantity, ${quantity}, 
:unit_id, :db_table_name, 
:admin_table_id, :db_table_id, :with_approval, :status, 
${socket.user.id},CURRENT_TIMESTAMP() 
)
`,
          { replacements: entryDetails, transaction }
        );
        if (!updateTableResult) {
          throw new Error("Error while updating update table of  ", table_name);
        }
        console.log("upadate table details =>");
        // release the hold quantity in source (which department sended this stock) departmet's stock space if stock is coming other than quality control
        // Commit the transaction if all entries are processed successfully
        await transaction.commit();
        socket.emit(currentRoute, {
          ...apiResponse.success(
            true,
            customMessage.stockAccepted,
            currentRoute
          ),
        });
        BroadcastMethod.broadcastToAllRequiredClients(
          { source: table_name },
          socket,
          io,
          currentRoute,
          true
        );
        // check if stock space is exists for respective product and packing size
        // if not exists then create
        // insert entry in stock info table
        // update stock in master stock table according to product and packing size
      } catch (error) {
        console.error("Error =>", error);
        await transaction.rollback();
        socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
        });
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
  // to display all invenotries and stock according to loggedin department
  async allInventoriesByDepartment(data, socket, io, currentRoute) {
    try {
      const isAdminLoggedIn = socket.user.id == 1 ? true : false;
      let { departmentId = false } = data;
      if (isAdminLoggedIn) {
        if (departmentId == 0 || !departmentId) {
          return socket.emit(currentRoute, {
            ...apiResponse.error(false, customMessage.badReq, currentRoute),
          });
        }
      }
      // all stock spaces of current department
      const stockSpaces = await MasterStockViewModel.findAll({
        where: {
          department_id: isAdminLoggedIn
            ? departmentId
            : socket.user.department_id,
          distribution_center_id: socket.user.distribution_center_id,
        },
      });
      console.log("stock spaces ->", stockSpaces);
      // all transactions in stock info
      const inventories = await StockInfoViewModel.findAll({
        where: {
          department_id: isAdminLoggedIn
            ? departmentId
            : socket.user.department_id,
        },
        order: [["created_on", "DESC"]],
      });

      const incoming = inventories.filter((inv) => inv.trns_type == "in");
      const outging = inventories.filter((inv) => inv.trns_type == "out");

      socket.emit(currentRoute, {
        ...apiResponse.success(true, "Inventories", currentRoute, {
          stockSpaces: stockSpaces ?? null,
          incoming: incoming ?? null,
          outging: outging ?? null,
        }),
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
  //   function to process entry for accept stock
  async processStockSpaceEntry(
    data,
    socket,
    transaction,
    currentRoute,
    stockSpaceSchema,
    sourceId
  ) {
    // if not then create
    // and update incoming stock in stock space
    // update distributed quantity in stock department table
    // and update entry in stock department update table
    try {
      console.log("entry data =>", data);
      const {
        stockSpaceId,
        quantity: productQuantity,
        trnsType,
        productId,
        unitId,
      } = await stockSpaceSchema.validate(data);
      const quantity =
        trnsType === "in"
          ? parseFloat(productQuantity)
          : parseFloat(productQuantity) * -1;
      let stockSpaceData = await MasterStockModel.findByPk(stockSpaceId, {
        include: {
          model: ProductModel,
          attributes: ["product_name"],
        },
        transaction,
      });
      if (!stockSpaceData) {
        socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `The stock space ` + customMessage.notEx
          ),
        });
        return false;
      }
      stockSpaceData = jsonFormator(stockSpaceData);
      console.log(stockSpaceData);
      // Check if stock space is inactive
      if (!stockSpaceData.status) {
        socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `The stock space '${stockSpaceData.name}' is inactive. Please choose another stock space  or activate this one.`
          ),
        });
        return false;
      }
      //   check is stock space product_id  is === entrie's product type
      const productCompatible = stockUtil.isProductCompatibleWithSpace(
        stockSpaceData,
        data.productId
      );
      // in case product is not compatible with space (ex. space is created for milk and you are trying to add curd in this)
      if (!productCompatible.is) {
        const { message } = productCompatible;
        socket.emit(currentRoute, {
          ...apiResponse.error(false, message),
        });
        return false;
      }

      console.log("stockspace details =>", stockSpaceData);

      // Handle underflow case
      if (quantity < 0) {
        const underFlow = stockUtil.underFlow(stockSpaceData, quantity);
        if (underFlow.is) {
          const { currentState } = underFlow;
          socket.emit(currentRoute, {
            ...apiResponse.error(false, underFlow.message, currentRoute, {
              currentState,
            }),
          });
          return false;
        }
      }
      // Handle overflow case
      //   if (quantity > 0) {
      //     const overflow = siloUtils.overFlow(stockSpaceData, quantity);
      //     if (overflow.is) {
      //       const { currentState } = overflow;
      //       socket.emit(currentRoute, {
      //         ...apiResponse.error(false, overflow.message, currentRoute, {
      //           currentState,
      //         }),
      //       });
      //       return false;
      //     }
      //   }
      // Insert new entry into InfoSilosModel
      const insertResult = await StockInfoModel.create(
        {
          stock_space_id: stockSpaceId,
          product_id: productId,
          quantity: quantity,
          status: true,
          unit_id: unitId,
          trns_type: trnsType,
          dpt_table_ref_id: sourceId,
          created_by: socket.user.id,
        },
        { transaction }
      );

      if (!insertResult) {
        throw new Error("Error while inserting milk data into InfoSilosModel");
      }

      // Update the total available milk in MasterSilosModel
      const [updateResult] = await MasterStockModel.update(
        {
          available_qty: Sequelize.literal(`available_qty + ${quantity}`),
        },
        {
          where: { id: stockSpaceId },
          transaction,
        }
      );

      if (!updateResult) {
        throw new Error("Error while updating available_qty in stock space");
      }

      return true;
    } catch (error) {
      console.error("ERROR =>>>>> :", error);
      if (error instanceof Yup.ValidationError) {
        socket.emit(currentRoute, {
          ...apiResponse.error(false, error.message, currentRoute, error),
        });
        return false;
      }
      throw new Error("Error while inserting milk ");
    }
  },
  // function to process the stock out for all departments
  async processStockOut(data, socket, io, currentRoute) {
    try {
      const { department_id: loggedInDepartment, isAdmin = false } =
        socket.user;
      const stockOutSchema = Yup.object({
        quantity: Yup.number()
          .typeError("please enter valid quantity !")
          .required("product quantity is required"),
        requestId: Yup.number()
          .typeError(customMessage.badReq)
          .required(customMessage.badReq),
      });
      // revice the admin table id (requestId) with other data (quantity,re )

      const { requestId, quantity: stockOutQty } =
        await stockOutSchema.validate(data);

      // get entry details by admin table id

      // extract {product_id,ms_packing_size,send_department_id,send_department_table,quantity}

      // check wether sufficent stock is available

      // insert a new stock out entry in crosponding department's table
      // insert in update table
      // insert details in info table
      // update stock
      // broadcast
      // finished

      let adminTableData = await QualityApprovalManagerWithAdmin.findByPk(
        requestId
      );

      // if data with provide is not available
      if (!adminTableData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.invalidReq, currentRoute),
        });
      }

      adminTableData = jsonFormator(adminTableData);
      console.log("admin table data fetched  =>", adminTableData);


      const {
        product_id,
        entry_type_id,
        master_packing_size_id,
        send_department_id,
        quantity: originalQty,
        rejected_quantity,
        unit_id,
        db_table_name: requestedDptTable,
        send_db_table_name: currentDptTable,
        in_department_id: requestedDptId,
        in_departmenthead_id: requestedDptHead,
      } = adminTableData;
      console.log("Login details :", {
        loggedInDepartment,
        send_department_id,
        isAdmin,
      });
      // verify that the entry should be request type
      if (entry_type_id !== 2) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Invalid request type " + customMessage.cantPerform,
            currentRoute,
            ""
          ),
        });
      }
      // TODO: the currunt user must be admin or belogs to current department
      if (loggedInDepartment !== send_department_id && !isAdmin) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "You are not authorized to perform this operation."
          ),
        });
      }
      // check if current user is admin or belongs to the department
      if (
        !socket.user.isAdmin &&
        socket.user.department_id !== send_department_id
      ) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "You are not authorized to perform this operation."
          ),
        });
      }
      console.log("current department =>", currentDptTable);
      let packingSizeDetails = {
        weight: 0.0,
        mrp: 0.0,
      };
      // if proudct have a valid packing size
      if (master_packing_size_id !== 0) {
        packingSizeDetails = jsonFormator(
          await MasterPackingSizeModel.findByPk(master_packing_size_id)
        );
        if (!packingSizeDetails) {
          return socket.emit(currentRoute, {
            ...apiResponse.error(
              false,
              "unsupported packing size " + customMessage.cantPerform,
              currentRoute,
              ""
            ),
          });
        }
      }
      // get details from current department table
      let requestData = await sequelize.models[currentDptTable].findOne({
        where: {
          admin_table_id: requestId,
        },
      });
      requestData = jsonFormator(requestData);

      // check whether the stock is proceesed with this request

      if (requestData.distributed_quantity > 0) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Stock is already processed for this request`
          ),
        });
      }

      // original requested quantity
      const originalReqQty = Number(requestData.quantity);

      console.log(
        `request data fechced form table '${currentDptTable}' =>`,
        requestData
      );

      // check wether stock out quantity is greater than approved quanitity(quantity in current department's table)

      if (stockOutQty > originalReqQty) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Can't dispatch stock more than request quantity '${originalReqQty}'`
          ),
        });
      }
      // find out current stock  of requested product
      let availableStock = jsonFormator(
        await MasterStockModel.findOne({
          where: {
            product_id,
            master_packing_size_id,
            master_department_id: send_department_id,
          },
        })
      );

      console.log("available stock details =>", availableStock);
      // if stock is not found

      if (!availableStock) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.insfStock, currentRoute),
        });
      }

      console.log("current stock details =>", availableStock);
      // check wether sufficient stock is avaialble
      const currentStock = Number(availableStock.available_qty);

      if (currentStock - stockOutQty < 0) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Not enough stock available for dispatching .  available stock :${currentStock} , required stock: ${stockOutQty}`,
            currentRoute
          ),
        });
      }
      const transaction = await sequelize.transaction();
      try {
        console.log("requestData.id =>", requestData.id);

        // update distributed quantity in current depertment table

        const [updateDistributedQty] = await sequelize.models[
          currentDptTable
        ].update(
          {
            distributed_quantity: stockOutQty,
          },
          {
            where: {
              id: requestData.id,
            },
            transaction,
          }
        );
        console.log(
          "distributed_quantity update result =>",
          updateDistributedQty
        );
        // return
        if (!updateDistributedQty) {
          throw new Error("error while updating distributed quantity");
        }
        console.log("distributed quantity updated=>", updateDistributedQty);
        // insert an stock out entry in current department table
        const upcomingId =
          (await sequelize.models[currentDptTable].max("id")) + 1;
        let stockOutResult = await sequelize.models[currentDptTable].create(
          {
            entry_type_id: 4, //stock out
            this_table_ref_id: requestData.id,
            product_id: product_id,
            unit_id: unit_id,
            quantity: stockOutQty,
            master_packing_size_id: master_packing_size_id,
            distributed_quantity: stockOutQty,
            department_id: requestedDptId,
            departmenthead_id: adminTableData.in_departmenthead_id,
            db_table_name: requestedDptTable,
            db_table_id: upcomingId,
            ms_product_type_id: adminTableData.ms_product_type_id,
            approval_status_id: 1,
            created_by: socket?.user?.id,
          },
          { transaction }
        );
        if (!stockOutResult) {
          throw new Error(
            "Error while inserting stock out data into current department's table"
          );
        }
        stockOutResult = jsonFormator(stockOutResult);
        const refId = stockOutResult.id;
        delete stockOutResult.id;
        // insert data in update table of current department
        const updateResult = await sequelize.models[
          currentDptTable + "_Update"
        ].create(
          {
            ...stockOutResult,
            activity: "New",
            ref_table_id: refId,
            created_on: sequelize.literal("CURRENT_TIMESTAMP"),
            updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
            created_by: socket?.user?.id,
          },
          { transaction }
        );
        if (!updateResult) {
          throw new Error(
            "Error while inserting update data into current department's table"
          );
        }

        // insert data in admin table

        const details = {
          product_id: product_id,
          quantity: stockOutQty,
          unit_id: unit_id,
          pricePerUnit: 0,
          db_table_name: currentDptTable,
          send_db_table_name: requestedDptTable,
          db_table_id: refId,
          in_departmenthead_id: socket.user.id,
          in_department_id: socket.user.department_id,
          send_department_id: requestedDptId,
          send_departmenthead_id: requestedDptHead,
          ms_product_type_id: adminTableData.ms_product_type_id,
          master_packing_size_id: adminTableData.master_packing_size_id ?? 0,
          entry_type_id: 4,
          bill_image: null,
          created_by: socket.user.id,
        };
        // insert data in admin approval table
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
        // update current department table (subtract stock out quanity )
        let [updateCurrentDepartmentStock] = await MasterStockModel.update(
          {
            available_qty: Sequelize.literal(`available_qty - ${stockOutQty}`),
            hold_quantity: sequelize.literal(`hold_quantity + ${stockOutQty}`),
          },
          {
            where: {
              id: availableStock.id,
            },
            transaction,
          }
        );
        if (!updateCurrentDepartmentStock) {
          throw new Error("Error while updating current department's stock");
        }
        // insert data  in stock info table
        const infoResult = await StockInfoModel.create(
          {
            master_stock_id: availableStock?.id,
            department_id: socket?.user?.department_id,
            dpt_table_ref_id: refId,
            product_id: product_id,
            weight_per_unit: packingSizeDetails.weight,
            quantity: stockOutQty,
            trns_type: "Out",
            packing_process_id: 0,
            master_packing_size_id: master_packing_size_id,
            product_type: 3, // 3 for factory products
            price_per_unit: packingSizeDetails?.mrp,
            total_price: Number(packingSizeDetails?.mrp ?? 0 * stockOutQty),
            trans_remark: `STOCK OUT TO ${requestedDptTable}`,
            previous_stock: availableStock.available_qty,
            current_stock: Number(availableStock?.available_qty) - stockOutQty,
            created_by: socket?.user?.id,
            distribution_center_id: 0,
            retail_shop_id: 0,
          },
          { transaction }
        );
        if (!infoResult) {
          throw new Error(
            "Error while inserting stock info data into stock-info table"
          );
        }
        // at this point we assume that everything is ok
        await transaction.commit();
        socket.emit(currentRoute, {
          success: true,
          message: `stock out successfully`,
        });
        // broadcat to the current clinet and admin
        BroadcastMethod.broadcastToAllRequiredClients(
          {
            source: currentDptTable,
          },
          socket,
          io,
          currentRoute,
          true
        );
      } catch (error) {
        await transaction.rollback();
        console.log("Error =>", error);
        socket.emit(currentRoute, {
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

  // to view the list of availabele products

  async listOfAvalilableProducts(data, socket, io, currentRoute) {
    try {
      const { department_id: currentDepartment } = socket.user;

      console.table(socket.user);

      // fetch the all stocks space of this department

      const allStockSpace = jsonFormator(
        await MasterStockViewModel.findAll({
          attributes: ["product_id", "product_name"],
          distict: true,
          where: {
            department_id: currentDepartment,
            distribution_center_id: socket?.user?.distribution_center_id,
            retail_shop_id: socket?.user?.retail_shop_id,
          },
          group: ["product_id"],
        })
      );
      socket.emit(currentRoute, {
        ...apiResponse.success(true, "success", currentRoute, allStockSpace),
      });
    } catch (error) {
      console.error("Error :", error);
    }
  },
  // view list of packing size according to stock of product
  async stockProductsPackingSizes(data, socket, io, currentRoute) {
    try {
      const { id } = await idSchema.validate(data);
      console.log("product id =>", id);
      const isProductExists = jsonFormator(
        await MasterStockViewModel.findOne({
          where: {
            product_id: id,
            department_id: socket?.user?.department_id,
            is_packed_product: true,
          },
        })
      );
      if (!isProductExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.success(
            false,
            "packing size not exists",
            currentRoute
          ),
        });
      }
      // find all packing size
      const allPackingSizes = jsonFormator(
        await MasterStockViewModel.findAll({
          attributes: [
            "packing_size_id",
            "weight",
            "st_name",
            "available_qty",
            "stock_st_name",
            "stock_uom",
          ],
          where: {
            product_id: id,
            department_id: socket?.user?.department_id,
          },
        })
      );

      socket.emit(currentRoute, {
        ...apiResponse.success(true, "suceess", currentRoute, allPackingSizes),
      });
    } catch (error) {
      console.log("Error =>", error);
    }
  },
};

export default stockInfoControllers;
