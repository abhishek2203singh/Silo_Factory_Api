import moment from "moment";
import { Op } from "sequelize";
import { DistributionCenterDepartmentModal } from "../model/distributionCenter.modal.js";
import { schedulingTimeModel } from "../model/distributionCenterTimeScheduler.modal.js";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
import { customMessage } from "../utility/messages.util.js";
import { apiResponse } from "../utility/response.util.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { sequelize } from "../config/dbConfig.js";
import { distributionCenterSchema } from "../yup-schemas/distributionCenter.schema.js";
import { DistributionCenterDepartmentUpdateModal } from "../model/distributionCenterDepartmentUpdate.modal.js";
import commonControllers from "./common.controller.js";
import { MasterDistributionCentersModel } from "../model/masterDistributionCenter.model.js";
import { VKDistributionCenterDepartmentModal } from "../model/views/distributionCenterView.modal.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import { MasterPackingSizeModel } from "../model/masterPackingSize.model.js";
import { transferStockQtySchema } from "../yup-schemas/distributeStockQty.schema.js";
import { MasterStockModel } from "../model/masterStock.model.js";
import { RetailShopDepartmentModal } from "../model/retailShop.modal.js";
import { StockInfoModel } from "../model/stockInfo.model.js";
import { RetailShopDepartmentUpdateModal } from "../model/retailShopUpdate.modal.js";
import { forReturnStockSchema } from "../yup-schemas/stockReturn.schema.js";
import { BroadcastMethod } from "../Common/Broadcast.js";
import Yup from "yup";
import { ProductModel } from "../model/product.model.js";
import { VkProductPackingSizeModel } from "../model/views/productPackingSizeView.modal.js";
const distributionCenterController = {
  // Insert Data to distribution center department
  async addDistributionData(data = {}, socket, io, currentRoute) {
    try {
      distributionCenterSchema;
      const { entryType, productId, quantity, masterPckSizeUnit } =
        await distributionCenterSchema.validate(data, {
          abortEarly: true,
          stripUnknown: true,
        });
      let departmentDetails = await MasterDepartmentModel.findByPk(2);
      if (!departmentDetails) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Department" + customMessage.notEx,
            currentRoute,
            ""
          ),
        });
      }
      const currentTime = moment();
      const fiveMinutesAgo = moment().subtract(5, "minutes");
      const { table_name } = jsonFormator(departmentDetails);
      let nextId = await DistributionCenterDepartmentModal.max("id");
      nextId = nextId == null ? 1 : nextId + 1;
      // get ms_product_type_id and unit_id from Master_Packing_Size
      let msPackSizeData = await MasterPackingSizeModel.findByPk(
        masterPckSizeUnit
      );
      if (!msPackSizeData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Packing Size" + customMessage.notFound,
            currentRoute,
            ""
          ),
        });
      }
      msPackSizeData = jsonFormator(msPackSizeData);
      const unitId = msPackSizeData.unit_id;
      const msProductTypeId = msPackSizeData.ms_product_type_id;
      const isExistsDistributionData =
        await DistributionCenterDepartmentModal.findOne({
          where: {
            entry_type_id: entryType,
            product_id: productId,
            quantity: quantity,
            created_on: {
              [Op.between]: [fiveMinutesAgo.toDate(), currentTime.toDate()],
            },
          },
        });
      if (isExistsDistributionData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.dup, currentRoute),
        });
      }
      const transaction = await sequelize.transaction();
      let distributionDetails = await MasterDistributionCentersModel.findOne({
        where: {
          manager_or_owner: socket.user.id,
        },
      });
      if (!distributionDetails) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.notAllowed, currentRoute),
        });
      }
      const { id } = jsonFormator(distributionDetails);
      let insertDistributionData =
        await DistributionCenterDepartmentModal.create(
          {
            entry_type_id: entryType,
            product_id: productId,
            quantity: quantity,
            ms_product_type_id: msProductTypeId,
            master_packing_size_id: masterPckSizeUnit,
            unit_id: masterPckSizeUnit ? 5 : unitId, //if packing size is selected then unit will be pcs else according to selected unit
            department_id: 6,
            departmenthead_id: socket.user.id,
            dist_center_id: id,
            db_table_name: table_name,
            db_table_id: nextId,
            created_by: socket.user.id,
          },
          { transaction }
        );
      if (!insertDistributionData) {
        throw new Error("error while inserting ");
      }
      insertDistributionData = jsonFormator(insertDistributionData);
      const insertId = insertDistributionData.id;
      delete insertDistributionData.id;
      const cloneDistributionData =
        await DistributionCenterDepartmentUpdateModal.create(
          {
            ...insertDistributionData,
            ref_table_id: insertId,
            activity: "New",
          },
          { transaction }
        );
      if (!cloneDistributionData) {
        throw new Error(
          "Error in creating second entry in distribution-department_update table =>"
        );
      }
      const details = {
        product_id: productId,
        quantity: quantity,
        productTypeId: msProductTypeId,
        packingSizeId: masterPckSizeUnit,
        unit_id: unitId,
        db_table_name: "DistributionCenter_Department",
        send_db_table_name: table_name,
        db_table_id: insertId,
        dist_center_id: id,
        in_departmenthead_id: socket.user.id,
        in_department_id: socket.user.department_id,
        send_department_id: 2,
        send_departmenthead_id: socket.user.id,
        entry_type_id: insertDistributionData?.entry_type_id,
        bill_image: null,
        created_by: socket.user.id,
      };
      const insertAdminApproval =
        await commonControllers.insertApprovalForManagerAdmin(
          details,
          transaction,
          socket,
          io,
          currentRoute
        );
      if (!insertAdminApproval) {
        throw new Error("error while inserting ");
      }
      await transaction.commit();
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Entry Added Successfully !!",
          currentRoute
        ),
      });
      // broad cast to admin
      BroadcastMethod.broadcastToAllRequiredClients(
        {},
        socket,
        io,
        currentRoute
      );
      return this.getDistributionData(data, socket, io, "distribution-dpt:get");
    } catch (error) {
      console.log(error);
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  // Return data distribution to stock department table
  async returnDistributionData(data = {}, socket, io, currentRoute) {
    try {
      forReturnStockSchema;
      const { productId, quantity, masterPckSizeUnit, message } =
        await forReturnStockSchema.validate(data, {
          abortEarly: true,
          stripUnknown: true,
        });
      let departmentDetails = await MasterDepartmentModel.findByPk(2);
      if (!departmentDetails) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Department" + customMessage.notEx,
            currentRoute,
            ""
          ),
        });
      }
      const currentTime = moment();
      const fiveMinutesAgo = moment().subtract(5, "minutes");
      const { table_name } = jsonFormator(departmentDetails);
      let nextId = await DistributionCenterDepartmentModal.max("id");
      nextId = nextId == null ? 1 : nextId + 1;
      // get ms_product_type_id and unit_id from Master_Packing_Size
      let msPackSizeData = await MasterPackingSizeModel.findByPk(
        masterPckSizeUnit
      );
      if (!msPackSizeData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Packing Size" + customMessage.notFound,
            currentRoute,
            ""
          ),
        });
      }
      const {
        unit_id: unitId,
        weight: weight,
        mrp: mrp,
        ms_product_type_id: msProductTypeId,
      } = jsonFormator(msPackSizeData);
      const isExistsDistributionData =
        await DistributionCenterDepartmentModal.findOne({
          where: {
            entry_type_id: 5,
            product_id: productId,
            quantity: quantity,
            created_on: {
              [Op.between]: [fiveMinutesAgo.toDate(), currentTime.toDate()],
            },
          },
        });
      if (isExistsDistributionData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.dup, currentRoute),
        });
      }
      let distributionDetails = await MasterDistributionCentersModel.findOne({
        where: {
          manager_or_owner: socket.user.id,
        },
      });
      if (!distributionDetails) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.notAllowed, currentRoute),
        });
      }
      const { id } = jsonFormator(distributionDetails);
      const checkAvlQty = await MasterStockModel.findOne({
        where: {
          master_department_id: 6,
          product_id: productId,
          distribution_center_id: id,
        },
      });
      if (!checkAvlQty) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.notFound, currentRoute),
        });
      }
      const { available_qty, id: rowId } = jsonFormator(checkAvlQty);
      const checkQty = available_qty > quantity;
      const remainingQty = parseInt(available_qty) - parseInt(quantity);
      if (!checkQty) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Stock cannot be returned above the available quantity.",
            currentRoute
          ),
        });
      }
      const transaction = await sequelize.transaction();
      try {
        let insertDistributionData =
          await DistributionCenterDepartmentModal.create(
            {
              entry_type_id: 5,
              product_id: productId,
              quantity: quantity,
              ms_product_type_id: msProductTypeId,
              message_val: message,
              master_packing_size_id: masterPckSizeUnit,
              unit_id: unitId,
              department_id: 6,
              departmenthead_id: socket.user.id,
              dist_center_id: id,
              db_table_name: table_name,
              db_table_id: nextId,
              created_by: socket.user.id,
            },
            { transaction }
          );
        if (!insertDistributionData) {
          throw new Error("error while inserting ");
        }
        insertDistributionData = jsonFormator(insertDistributionData);
        const insertId = insertDistributionData.id;
        delete insertDistributionData.id;
        const cloneDistributionData =
          await DistributionCenterDepartmentUpdateModal.create(
            {
              ...insertDistributionData,
              ref_table_id: insertId,
              activity: "New",
            },
            { transaction }
          );
        if (!cloneDistributionData) {
          throw new Error(
            "Error in creating second entry in distribution-department_update table =>"
          );
        }
        let stockInfoEntry = await StockInfoModel.create(
          {
            master_stock_id: rowId,
            department_id: 6,
            dpt_table_ref_id: insertId,
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
            distribution_center_id: id,
            created_by: socket.user.id,
          },
          { transaction }
        );
        if (!stockInfoEntry) {
          throw new Error("Error in creating  entry in stock-info table =>");
        }
        // update master stock table
        let updateMasterTble = await MasterStockModel.update(
          {
            available_qty: remainingQty,
            hold_quantity: quantity,
            updated_by: socket.user.id,
          },
          { where: { id: rowId }, transaction }
        );
        if (!updateMasterTble) {
          throw new Error("Error in updating in  master-stock table =>");
        }
        const details = {
          product_id: productId,
          quantity: quantity,
          productTypeId: msProductTypeId,
          packingSizeId: masterPckSizeUnit,
          unit_id: unitId,
          db_table_name: "DistributionCenter_Department",
          send_db_table_name: table_name,
          db_table_id: insertId,
          dist_center_id: id,
          in_departmenthead_id: socket.user.id,
          in_department_id: socket.user.department_id,
          send_department_id: 2,
          send_departmenthead_id: socket.user.id,
          entry_type_id: insertDistributionData?.entry_type_id,
          bill_image: null,
          created_by: socket.user.id,
        };
        const insertAdminApproval =
          await commonControllers.insertApprovalForManagerAdmin(
            details,
            transaction,
            socket,
            io,
            currentRoute
          );
        if (!insertAdminApproval) {
          throw new Error("error while inserting ");
        }
        await transaction.commit();
        socket.emit(currentRoute, {
          ...apiResponse.success(
            true,
            "Entry Added Successfully !!",
            currentRoute
          ),
        });
        return this.getDistributionData(
          data,
          socket,
          io,
          "distribution-dpt:get"
        );
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
        });
      }
    } catch (error) {
      return socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  // Fetched all distribution data
  async getDistributionData(data, socket, io, currentRoute) {
    try {
      let distrubutionCenterData;
      let dataaccordingToCenterId;
      if (socket.user.role_id === 1) {
        dataaccordingToCenterId =
          await VKDistributionCenterDepartmentModal.findAll({
            order: [["created_on", "DESC"]],
          });
        dataaccordingToCenterId = jsonFormator(dataaccordingToCenterId);
        return socket.emit(currentRoute, {
          ...apiResponse.success(
            true,
            "Data Fetched Successfully!!",
            currentRoute,
            dataaccordingToCenterId
          ),
        });
      } else {
        distrubutionCenterData = await MasterDistributionCentersModel.findOne({
          where: {
            manager_or_owner: socket.user.id,
          },
        });
      }
      const { id } = jsonFormator(distrubutionCenterData);
      dataaccordingToCenterId =
        await VKDistributionCenterDepartmentModal.findAll({
          where: {
            distCenterId: id,
          },
          order: [["created_on", "DESC"]],
        });
      if (!dataaccordingToCenterId) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.notFound, currentRoute),
        });
      }
      dataaccordingToCenterId = jsonFormator(dataaccordingToCenterId);
      return socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Data Fetched Successfully!!",
          currentRoute,
          dataaccordingToCenterId
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  // Fetched all distribution data :By Id
  async getDistributionDataforViewById(data, socket, io, currentRoute) {
    try {
      console.log("amit>>>>", data);
      const { id } = await idSchema.validate(data);
      let distrubutionCenterData = await MasterDistributionCentersModel.findOne(
        {
          where: {
            manager_or_owner: socket.user.id,
          },
        }
      );
      const { id: distCenterId } = jsonFormator(distrubutionCenterData);
      let dataaccordingToCenterId =
        await VKDistributionCenterDepartmentModal.findOne({
          where: {
            distCenterId: distCenterId,
            id,
          },
        });
      if (!dataaccordingToCenterId) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.notFound, currentRoute),
        });
      }
      dataaccordingToCenterId = jsonFormator(dataaccordingToCenterId);
      return socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Data Fetched Successfully!!",
          currentRoute,
          dataaccordingToCenterId
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async getDistributionDataByid(data, socket, io, currentRoute) {
    try {
      const { id } = data;
      let dataByid = await DistributionCenterDepartmentModal.findOne({
        where: {
          id: id,
        },
      });
      if (!dataByid) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "Data not found!!", currentRoute, ""),
        });
      }
      dataByid = jsonFormator(dataByid);
      return socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Distribution Data found!!",
          currentRoute,
          dataByid
        ),
      });
    } catch (error) {
      return socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  // edit distribution data
  async updateData(data, socket, io, currentRoute) {
    try {
      const updateSchema = distributionCenterSchema.concat(idSchema);
      const { entryType, productId, quantity, masterPckSizeUnit, id } =
        await updateSchema.validate(data, {
          abortEarly: true,
          stripUnknown: true,
        });
      let distributionDetails = await MasterDistributionCentersModel.findOne({
        where: {
          manager_or_owner: socket.user.id,
        },
      });
      if (!distributionDetails) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.dup, currentRoute),
        });
      }
      const Dist_id = distributionDetails.dataValues.id;
      let departmentDetails = await MasterDepartmentModel.findByPk(6);
      if (!departmentDetails) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Department" + customMessage.notEx,
            currentRoute,
            ""
          ),
        });
      }
      const { table_name } = jsonFormator(departmentDetails);
      let isExistsData = await DistributionCenterDepartmentModal.findOne({
        where: {
          id: id,
        },
      });
      if (!isExistsData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Department" + customMessage.notEx,
            currentRoute,
            ""
          ),
        });
      }
      const { approval_status_id } = jsonFormator(isExistsData);
      // check if entry type id and manager approval is pending ------
      if (entryType !== 2 && approval_status_id !== 1) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "This entry not changeable",
            currentRoute
          ),
        });
      }
      let msPackSizeData = await MasterPackingSizeModel.findByPk(
        masterPckSizeUnit
      );
      if (!msPackSizeData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Packing Unit" + customMessage.notFound,
            currentRoute,
            ""
          ),
        });
      }
      msPackSizeData = jsonFormator(msPackSizeData);
      const unitId = msPackSizeData.unit_id;
      const msProductTypeId = msPackSizeData.ms_product_type_id;
      const transaction = await sequelize.transaction();
      try {
        let [updateData] = await DistributionCenterDepartmentModal.update(
          {
            entry_type_id: entryType,
            product_id: productId,
            quantity: quantity,
            master_packing_size_id: masterPckSizeUnit,
            updated_by: socket.user.id,
          },
          { where: { id: id }, transaction }
        );
        console.log("after update", updateData);
        if (!updateData) {
          console.log("update result =>", updateData);
          throw new Error("error while updating ");
        }
        // updateData = jsonFormator(updateData);
        const cloneDistributionData =
          await DistributionCenterDepartmentUpdateModal.create(
            {
              entry_type_id: entryType,
              product_id: productId,
              quantity: quantity,
              ms_product_type_id: msProductTypeId,
              master_packing_size_id: masterPckSizeUnit,
              unit_id: unitId,
              ref_table_id: id,
              dist_center_id: Dist_id,
              department_id: 6,
              departmenthead_id: socket.user.id,
              db_table_name: table_name,
              db_table_id: id,
              created_by: socket.user.id,
              activity: "New",
            },
            { transaction }
          );
        if (!cloneDistributionData) {
          throw new Error(
            "Error in creating second entry in pasteurization-department_update table =>"
          );
        }
        const details = {
          product_id: productId,
          quantity: quantity,
          ms_product_type_id: msProductTypeId,
          master_packing_size_id: masterPckSizeUnit,
          db_table_name: "DistributionCenter_Department",
          send_db_table_name: table_name,
          db_table_id: id,
          dist_center_id: id,
          in_departmenthead_id: socket.user.id,
          in_department_id: socket.user.department_id,
          send_department_id: 6,
          send_departmenthead_id: socket.user.id,
          entry_type_id: entryType,
          bill_image: null,
          created_by: socket.user.id,
        };
        const insertAdminApproval =
          await commonControllers.updateApprovalForManagerAdmin(
            details,
            transaction,
            table_name,
            id,
            socket,
            io,
            currentRoute
          );
        if (!insertAdminApproval) {
          throw new Error("error while inserting ");
        }
        // broad cast to admin
        BroadcastMethod.broadcastToAllRequiredClients(
          {},
          socket,
          io,
          currentRoute
        );
        await transaction.commit();
        socket.emit(currentRoute, {
          ...apiResponse.success(true, customMessage.updSucc, currentRoute),
        });
        this.getDistributionData(data, socket, io, "distribution-dpt:get");
      } catch (error) {
        await transaction.rollback();
        console.log(error);
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            customMessage.wentWrong,
            currentRoute,
            error
          ),
        });
      }
    } catch (error) {
      return socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  // Send requested quantity to retail shop department
  async sendRequestedStock(data, socket, io, currentRoute) {
    try {
      console.table(data);
      transferStockQtySchema;
      const { dispatchedStockQty, trnsMessage, sellingPrice, id } =
        await transferStockQtySchema.validate(data);
      let getRequestedData = await DistributionCenterDepartmentModal.findOne({
        where: {
          id: id,
          status: true,
        },
      });
      if (!getRequestedData) {
        console.log("requested data =>", getRequestedData);
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Request details " + customMessage.notFound,
            currentRoute
          ),
        });
      }
      const {
        product_id: productId,
        created_by: retailId,
        unit_id: unitId,
        retail_table_ref_id: retailRefId,
        dist_center_id: distCenterId,
        quantity: quantity,
        ms_product_type_id: productType,
        department_id: departmentId,
        master_packing_size_id: packingSizeId,
        created_by,
      } = jsonFormator(getRequestedData);
      // if current deparmet is sending stock to self
      if (departmentId == socket.user.department_id) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.invalidReq, currentRoute),
        });
      }
      // if requeseted department is not the retail shop or not associated with curent distribution
      if (departmentId !== 7) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.invalidReq, currentRoute),
        });
      }
      // const isValidRetailShop=jsonFormator(await UserModel.findByPk(cre))
      //TODO
      // loggedin user and requested user both  are same
      if (created_by == socket.user.id) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.invalidReq, currentRoute),
        });
      }
      const checkDisptachedqty = dispatchedStockQty <= quantity;
      if (!checkDisptachedqty) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Dispatched Quantity is not greater than requested quantity!!",
            currentRoute,
            ""
          ),
        });
      }
      console.log("request details =>", getRequestedData);
      // get product and packing size details
      const productDetails = jsonFormator(
        await ProductModel.findByPk(getRequestedData.product_id)
      );
      let packingSizeData = null;
      if (packingSizeId) {
        packingSizeData = jsonFormator(
          await VkProductPackingSizeModel.findOne({
            where: {
              packing_size_id: packingSizeId,
            },
          })
        );
      }
      // if(pro)
      const checkAvlQty = await MasterStockModel.findOne({
        where: {
          master_department_id: 6,
          product_id: productId,
          distribution_center_id: distCenterId,
          master_packing_size_id: packingSizeId,
        },
      });
      // check wether stock space of selected product is exists or not
      if (!checkAvlQty) {
        console.log("packing size data =>", packingSizeData);
        const message = packingSizeData
          ? `  '${packingSizeData.weight} ${String(
            packingSizeData.st_name
          ).toUpperCase()}' ${packingSizeData.product_name}`
          : productDetails.product_name;
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            customMessage.insfStock + "of" + message,
            currentRoute
          ),
        });
      }
      const { available_qty, hold_quantity } = jsonFormator(checkAvlQty);
      const masterTblId = checkAvlQty.id;
      const checkQty = available_qty > dispatchedStockQty;
      if (!checkQty) {
        const message = packingSizeData
          ? `  '${packingSizeData.weight} ${String(
            packingSizeData.st_name
          ).toUpperCase()}' ${packingSizeData.product_name}`
          : productDetails.product_name;
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            customMessage.insfStock +
            "of" +
            message +
            `only ${available_qty} is available`,
            currentRoute,
            ""
          ),
        });
      }
      const remainingQty =
        parseInt(available_qty) - parseInt(dispatchedStockQty);
      // if already some stock in hold then --------
      const totalHoldQty = hold_quantity + Number(dispatchedStockQty);
      // get packing unit weight and id
      let packingData = await MasterPackingSizeModel.findByPk(packingSizeId);
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
      const { weight } = jsonFormator(packingData);
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
      let nextId = await DistributionCenterDepartmentModal.max("id");
      nextId = nextId == null ? 1 : nextId + 1;
      const transaction = await sequelize.transaction();
      let stockInfoUpdate = await MasterStockModel.update(
        {
          available_qty: remainingQty,
          hold_quantity: totalHoldQty,
          updated_by: socket.user.id,
        },
        {
          where: {
            product_id: productId,
            master_packing_size_id: packingSizeId,
            master_department_id: 6,
          },
          transaction,
        }
      );
      if (!stockInfoUpdate) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Quantiy" + customMessage.cantModify,
            customMessage,
            ""
          ),
        });
      }
      const insertStockInfo = await StockInfoModel.create(
        {
          department_id: 6,
          dpt_table_ref_id: id,
          product_id: productId,
          weight_per_unit: weight,
          master_packing_size_id: packingSizeId,
          master_stock_id: masterTblId,
          trns_type: "out",
          trans_remark: trnsMessage,
          product_type: productType,
          quantity: dispatchedStockQty,
          price_per_unit: sellingPrice,
          previous_stock: available_qty,
          distribution_center_id: distCenterId,
          retail_shop_id: retailId,
          current_stock: remainingQty,
          created_by: socket.user.id,
        },
        { transaction }
      );
      if (!insertStockInfo) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Stock Info" + customMessage.creaErr,
            currentRoute,
            ""
          ),
        });
      }
      let addEntry = await DistributionCenterDepartmentModal.create(
        {
          entry_type_id: 4,
          retail_table_ref_id: retailRefId,
          product_id: productId,
          quantity: quantity,
          distributed_quantity: dispatchedStockQty,
          ms_product_type_id: productType,
          master_packing_size_id: packingSizeId,
          unit_id: unitId,
          department_id: departmentId,
          departmenthead_id: socket.user.id,
          dist_center_id: distCenterId,
          db_table_name: table_name,
          db_table_id: nextId,
          created_by: socket.user.id,
        },
        { transaction }
      );
      if (!addEntry) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.creaErr, currentRoute),
        });
      }
      addEntry = jsonFormator(addEntry);
      const insertedId = addEntry.id;
      delete addEntry.id;
      let addEntryInUpdateTble =
        await DistributionCenterDepartmentUpdateModal.create(
          {
            ...addEntry,
            ref_table_id: insertedId,
            activity: "New",
          },
          { transaction }
        );
      if (!addEntryInUpdateTble) {
        throw new Error(
          "Error in creating second entry in pasteurization-department_update table =>"
        );
      }
      let createRetailData = await RetailShopDepartmentModal.create(
        {
          retail_user_id: retailId,
          entry_type_id: 3,
          product_id: productId,
          ms_product_type_id: productType,
          master_packing_size_id: packingSizeId,
          quantity: dispatchedStockQty,
          priceper_unit: sellingPrice,
          bill_image: null,
          weight_per_unit: weight,
          department_id: 6,
          distribution_center_id: distCenterId,
          created_by: socket.user.id,
        },
        { transaction }
      );
      if (!createRetailData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.creaErr, currentRoute),
        });
      }
      createRetailData = jsonFormator(createRetailData);
      const insertId = createRetailData.id;
      delete createRetailData.id;
      const createUpdateData = await RetailShopDepartmentUpdateModal.create({
        ...createRetailData,
        ref_table_id: insertId,
        activity: "create",
      });
      if (!createUpdateData) {
        throw new Error(
          "Error in creating second entry in RetailShop-Department_update table =>"
        );
      }
      await transaction.commit();
      return socket.emit(currentRoute, {
        ...apiResponse.success(true, "Stock send Successfully!!", currentRoute),
      });
    } catch (error) {
      return socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async deleteDistributionData(data, socket, io, currentRoute) {
    try {
      const { id } = data;
      if (!id) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      let getRowData = await DistributionCenterDepartmentModal.findOne({
        where: {
          id: id,
          status: 1,
        },
      });
      if (!getRowData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.notFound, currentRoute),
        });
      }
      const {
        entry_type_id: entryType,
        approval_status_id: mgrAprlStatus,
        db_table_name,
      } = jsonFormator(getRowData);
      if (entryType != 2 && mgrAprlStatus != 1) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Entry not deleted. Quality Manager approval confirmed!",
            currentRoute
          ),
        });
      }
      const transaction = await sequelize.transaction();
      let changeStatus = await DistributionCenterDepartmentModal.update(
        {
          status: 0,
          updated_by: socket.user.id,
          updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
        },
        { where: { id: id }, transaction }
      );
      if (!changeStatus) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.delErr, currentRoute),
        });
      }
      // find data after status change or deleted data
      let distributionRowData = await DistributionCenterDepartmentModal.findOne(
        {
          where: {
            id: id,
          },
          transaction,
        }
      );
      if (!distributionRowData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Data" + customMessage.notFound,
            currentRoute
          ),
        });
      }
      const details = jsonFormator(distributionRowData);
      delete details.id;
      const cloneTbleCreate =
        await DistributionCenterDepartmentUpdateModal.create(
          {
            ...details,
            ref_table_id: id,
            created_by: socket.user.id,
            activity: "Delete",
          },
          { transaction }
        );
      if (!cloneTbleCreate) {
        throw new Error("error while inserting ");
      }
      // update status in admin table
      const adminDeleteResult =
        await commonControllers.deleteApprovalForManagerAdmin(
          {
            send_db_table_name: db_table_name,
            db_table_id: id,
            created_by: socket.user.id,
          },
          transaction,
          socket,
          io,
          currentRoute
        );
      if (!adminDeleteResult) {
        throw new Error("Error in deleteApprovalForManagerAdmin");
      }
      await transaction.commit();
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Data" + customMessage.delSucc,
          currentRoute
        ),
      });
      return this.getDistributionData(data, socket, io, "distribution-dpt:get");
    } catch (error) {
      return socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  // Accpet return data come from retail shop department return data
  async acceptReturnData(data, socket, io, currentRoute) {
    try {
      const messageSchema = await forReturnStockSchema.pick(["message"]);
      const stockScema = idSchema.concat(messageSchema);
      const { id, message } = await stockScema.validate(data);
      let getAcceptData = await DistributionCenterDepartmentModal.findOne({
        where: { id: id },
      });
      if (!getAcceptData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Return Distribution Data " + customMessage.notFound,
            currentRoute
          ),
        });
      }
      const {
        ms_product_type_id: productTypeId,
        quantity: quantity,
        distributed_quantity: distributeQty,
        product_id: productId,
        entry_type_id: entryId,
        departmenthead_id: departmentHeadId,
        master_packing_size_id: packingSizeId,
      } = jsonFormator(getAcceptData);
      if (entryId != 5) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.notAllowed, currentRoute),
        });
      }
      if (quantity === distributeQty) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "Stock already accepted!!", currentRoute),
        });
      }
      // get ms_product_type_id and unit_id from Master_Packing_Size
      let msPackSizeData = await MasterPackingSizeModel.findByPk(packingSizeId);
      if (!msPackSizeData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Packing Size" + customMessage.notFound,
            currentRoute,
            ""
          ),
        });
      }
      const { weight: weight, mrp: mrp } = jsonFormator(msPackSizeData);
      // get distribution stock data
      let stcokData = await MasterStockModel.findOne({
        where: {
          product_id: productId,
          master_packing_size_id: packingSizeId,
          distribution_center_id: socket.user.dist_center_id,
        },
      });
      if (!stcokData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Stock Data" + customMessage.invalidReq,
            currentRoute
          ),
        });
      }
      const { available_qty, id: stockRowId } = jsonFormator(stcokData);
      const totalgQty = parseInt(available_qty) + parseInt(quantity);
      // get distribution stock data for rretail shop department
      let getReatailStockData = await MasterStockModel.findOne({
        where: {
          product_id: productId,
          master_packing_size_id: packingSizeId,
          retail_shop_id: departmentHeadId,
        },
      });
      if (!getReatailStockData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "Reatail Shop Stock is not available!!"),
          currentRoute,
        });
      }
      const { id: retailStcokId } = jsonFormator(getReatailStockData);
      const transaction = await sequelize.transaction();
      try {
        // 1st update distributio table row
        let updateDistribution = await DistributionCenterDepartmentModal.update(
          {
            distributed_quantity: quantity,
            updated_by: socket.user.id,
          },
          { transaction }
        );
        if (!updateDistribution) {
          throw new Error("Error an while updating distribution department");
        }
        //create stock info new entry for distribution
        let createStockInfoTble = await StockInfoModel.create(
          {
            master_stock_id: stockRowId,
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
            created_by: socket.user.id,
            distribution_center_id: socket.user.dist_center_id,
          },
          { transaction }
        );
        if (!createStockInfoTble) {
          throw new Error("Error an while creating stock info table");
        }
        //update master stock table
        let updateStock = await MasterStockModel.update(
          {
            available_qty: totalgQty,
            updated_by: socket.user.id,
          },
          { where: { id: stockRowId }, transaction }
        );
        if (!updateStock) {
          throw new Error("Error an while updating master stock table");
        }
        // create stock info for reatail shop department
        let createRetailStockInfo = await StockInfoModel.create(
          {
            master_stock_id: retailStcokId,
            department_id: 7,
            dpt_table_ref_id: id,
            product_id: productId,
            weight_per_unit: weight,
            quantity: quantity,
            hold_quantity: quantity,
            trns_type: "return-req",
            product_type: productTypeId,
            master_packing_size_id: packingSizeId,
            price_per_unit: mrp,
            trans_remark: message,
            current_stock: available_qty,
            distribution_center_id: departmentHeadId,
            retail_shop_id: socket.user.retail_shop_id,
            created_by: socket.user.id,
          },
          { transaction }
        );
        if (!createRetailStockInfo) {
          throw new Error("Error while creating retail shop department");
        }
        //update retail shop department master stock data
        let updateRetailStock = await MasterStockModel.update(
          {
            hold_quantity: 0,
          },
          { where: { id: retailStcokId }, transaction }
        );
        if (!updateRetailStock) {
          throw new Error("Error while updating retail master stock table");
        }
        await transaction.commit();
        return socket.emit(currentRoute, {
          ...apiResponse.success(
            true,
            "Distribution Accept Data!!",
            currentRoute
          ),
        });
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.wentWrong, currentRoute),
        });
      }
    } catch (error) {
      return socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async scheduleTime(data, socket, io, currentRoute) {
    try {
      // to formate date
      let currentTime = data?.time;
      let [hour, minute] = currentTime.split(":");
      if (hour?.length == 1 && hour <= 9) {
        hour = "0" + hour;
      }
      if (minute?.length == 1 && minute <= 9) {
        minute = "0" + minute;
      }
      data.time = hour + ":" + minute;
      console.log({ midified: data.time });
      const schedultSchema = Yup.object({
        time: Yup.string()
          .matches(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            "Time must be in the format HH:mm and a valid 24-hour time"
          )
          .required("Time is required"),
        minBalance: Yup.number()
          .min(0, "please select a positive amount !")
          .required("minimum balance is required"),
      });
      const { time, minBalance } = await schedultSchema.validate(data);
      // Extract distribution center ID and format schedule time (without seconds)
      const { distribution_center_id } = socket.user;
      // Check if the same schedule time already exists for the distribution center
      const existingEntry = await schedulingTimeModel.findOne({
        where: {
          distribution_center_id: distribution_center_id,
        },
      });


      if (existingEntry) {
        // If entry exists, update it
        existingEntry.updated_by = socket.user.id;
        existingEntry.updated_on = sequelize.literal("CURRENT_TIMESTAMP");
        existingEntry.minimum_schduleing_balance = minBalance; // Update the minimum balance
        const updateResult = await existingEntry.save();
        if (!updateResult) {
          socket.emit(currentRoute, {
            ...apiResponse.error(false, customMessage.wentWrong),
          });
        }
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            true,
            `New scheduled time :${time} & minimum balance : ${minBalance} ` +
            customMessage.updSucc,
            currentRoute
          ),
        });
      }
      // If no entry exists, create a new one
      const newEntry = await schedulingTimeModel.create({
        distribution_center_id: distribution_center_id,
        schdule_time: time,
        minimum_schduleing_balance: minBalance, // Store the minimum balance
        created_by: socket.user.id,
        created_on: sequelize.literal("CURRENT_TIMESTAMP"),
      });
      if (!newEntry) {
        socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.wentWrong),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `New schedule time :${time} & minimum balance : ${minBalance} ` +
          customMessage.addSucc,
          currentRoute
        ),
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, error.message, currentRoute, error),
        });
      }
      console.error("Error saving schedule time:", error.message || error);
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  // Helper function to pad time values with leading zeros
};
export default distributionCenterController;

