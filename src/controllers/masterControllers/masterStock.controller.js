import Yup from "yup";
import { apiResponse } from "../../utility/response.util.js";
import { MasterStockModel } from "../../model/masterStock.model.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { customMessage } from "../../utility/messages.util.js";
import { idSchema } from "../../yup-schemas/idSchema.schema.js";
import { MasterPackingSizeModel } from "../../model/masterPackingSize.model.js";
import { ProductModel } from "../../model/product.model.js";
const stockSpaceSchema = Yup.object({
  productId: Yup.number()
    .typeError("Invalid product")
    .required("Please select product"),
});
// each and every row in master_stock table is known as (stock space)
const masterStockControllers = {
  // create new stock space
  async createStockSpace(data, socket, io, currentRoute) {
    try {
      const { productId } = await stockSpaceSchema.validate(data, {
        abortEarly: true,
        striptUnknow: true,
      });
      //  identify if role with given name already  exists
      // find product detail by product id to make sure product is active
      let productDetails = await ProductModel.findOne({
        where: {
          id: productId,
          status: true,
        },
      });
      //   if product is not active or not exists
      if (!productDetails) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Product ` + customMessage.notEx + "or Discontinued !",
            currentRoute
          ),
        });
      }
      productDetails = jsonFormator(productDetails);
      const existingStockSpace = await MasterStockModel.findOne({
        where: {
          product_id: productId,
          master_department_id: socket?.user?.department_id,
        },
      });
      // if role exists already
      if (existingStockSpace) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Stock space for product ' ${productDetails.product_name} ' already exists`,
            currentRoute,
            ""
          ),
        });
      }
      // to check whehere provide is a object or not
      if (typeof data !== "object" || data === null) {
        throw new Yup.ValidationError("Please check your inputs !");
      }
      //   get all available packing sizes according to product id
      let packingSizes = await MasterPackingSizeModel.findAll({
        where: {
          product_id: productId,
        },
      });
      // if packingSize is not exists for selected product
      if (!packingSizes.length) {
        const createResult = await MasterStockModel.create({
          available_qty: 0,
          product_id: productId,
          master_department_id: socket?.user?.department_id,
          unit_id: productDetails.uom,
          master_packing_size_id: 0,
          ms_product_id: productDetails.ms_product_id,
          status: true,
          is_packed_product: false,
          created_by: socket?.user?.id,
        });
        if (!createResult) {
          return socket.emit(currentRoute, {
            ...apiResponse.error(
              true,
              `An error occurred while creating the stock space. Please try again or contact support if the issue persists.`,
              currentRoute
            ),
          });
        }
        return socket.emit(currentRoute, {
          ...apiResponse.success(
            true,
            `Stock space created successfully for product '${productDetails.product_name}'`,
            currentRoute,
            createResult
          ),
        });
      }
      packingSizes = jsonFormator(packingSizes);
      // create stock space for each packing size according to product_id
      let stockSpaceToBeCreated = packingSizes.map((packingSize) => {
        return {
          available_qty: 0,
          product_id: productId,
          master_department_id: socket?.user?.department_id,
          unit_id: productDetails.uom,
          master_packing_size_id: packingSize.id,
          status: true,
          created_by: socket?.user?.id,
        };
      });
      console.table(stockSpaceToBeCreated);
      let createResult = await MasterStockModel.bulkCreate(
        stockSpaceToBeCreated,
        {
          validate: true,
        }
      );
      //   createResult = jsonFormator(createResult);
      console.log("created result =>", createResult);
      if (!createResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            true,
            `An error occurred while creating the stock space. Please try again or contact support if the issue persists.`,
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Stock space created successfully `,
          currentRoute
        ),
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, error.message, currentRoute, error),
        });
      }
      console.error(error);
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async createSingleStockSpaceAccordingToPackingSizeId(
    data,
    socket,
    io,
    currentRoute
  ) {
    try {
      const packingSizeIdSchema = Yup.object({
        packingSizeId: Yup.number()
          .typeError("please select valid packing size")
          .required("please select packing size"),
      });
      const newSchema = stockSpaceSchema.concat(packingSizeIdSchema);
      const { productId, packingSizeId } = await newSchema.validate(data, {
        abortEarly: true,
        striptUnknow: true,
      });
      // find product detail by product id to make sure product is active
      let productDetails = await ProductModel.findOne({
        where: {
          id: productId,
          status: true,
        },
      });
      //   if product is not active or not exists
      if (!productDetails) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Product ` + customMessage.notEx + "or Discontinued !",
            currentRoute
          ),
        });
      }
      productDetails = jsonFormator(productDetails);
      // check if stock space is exists in respose to provided packing size and product
      let isStockSpaceExists = await MasterStockModel.findOne({
        where: {
          master_department_id: socket?.user?.department_id,
          product_id: productId,
          master_packing_size_id: packingSizeId,
        },
      });
      console.log("isStockSpaceExists =>", isStockSpaceExists);
      if (isStockSpaceExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Stock space ` + customMessage.exists,
            currentRoute,
            ""
          ),
        });
      }
      const createResult = await MasterStockModel.create({
        available_qty: 0,
        product_id: productId,
        master_department_id: socket?.user?.department_id,
        unit_id: productDetails.uom,
        master_packing_size_id: packingSizeId,
        status: true,
        created_by: socket?.user?.id,
      });
      if (!createResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            true,
            `An error occurred while creating the stock space. Please try again or contact support if the issue persists.`,
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Stock space created successfully `,
          currentRoute
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
  // get stock space by id
  async getStockSpaceById(data, socket, io, currentRoute) {
    try {
      const { id = false } = data;
      if (!id || id < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      //   fetch stock space  by id
      let stockSpaceResult = await MasterStockModel.findOne({
        where: {
          id: id,
          status: true,
        },
      });
      //   if stock space not found
      if (!stockSpaceResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "stock space not found !",
            currentRoute,
            "Submenu not found"
          ),
        });
      }
      stockSpaceResult = jsonFormator(stockSpaceResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Stock space fetched successfully",
          currentRoute,
          stockSpaceResult
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  //   update stock space
  async updateStockSpace(data, socket, io, currentRoute) {
    try {
      console.table(data);
      const updateStockSpaceSchema = stockSpaceSchema.concat(idSchema);
      const { id, productId, unitId } = await updateStockSpaceSchema.validate(
        data
      );
      //  check wether stock space exists or not
      let isExists = await MasterStockModel.findByPk(id);
      // if stock space  not found
      if (!isExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, `Stock space not found`, currentRoute),
        });
      }
      // if stock space is can't be modified
      if (!isExists?.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Stock space '${isExists?.name}' ` + customMessage.cantModify
          ),
        });
      }
      //   update user role
      const [updateResult] = await MasterStockModel.update(
        {
          product_id: productId,
          unit_id: unitId,
          updated_by: socket.user.id,
        },
        {
          where: {
            id: id,
            owner_department: socket?.user?.department_id,
          },
        }
      );
      //   if role not updated in case of updateResult == 0
      if (!updateResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Stock space '${name}' not updated `,
            currentRoute
          ),
        });
      }
      //   stock space updated successfully
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Stock space " + customMessage.updSucc,
          currentRoute
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
  // delete stock space
  async deleteStockSpace(data, socket, io, currentRoute) {
    try {
      console.log("data =>", data);
      const { id = false } = data;
      if (!id || id < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      let stockSpaceDeteils = await MasterStockModel.findByPk(id);
      // if role not found
      if (!stockSpaceDeteils) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Stock space does not exists",
            currentRoute
          ),
        });
      }
      stockSpaceDeteils = jsonFormator(stockSpaceDeteils);
      if (!stockSpaceDeteils.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Stock space ' ${stockSpaceDeteils.name} '` +
            customMessage.cantModify
          ),
        });
      }
      //   other wise change status to false
      const [deleteResult] = await MasterStockModel.update(
        {
          status: false,
          updated_by: socket.user.id,
        },
        {
          where: {
            id,
          },
        }
      );
      // if  not updated
      if (!deleteResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            ` Stock space ${stockSpaceDeteils?.name} is not deleted !`,
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `The Stock space ' ${stockSpaceDeteils.name} ' has been deleted successfully ! `,
          currentRoute
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  //   to get all stock spaces
  async getAllStockSpaces(data, socket, io, currentRoute) {
    try {
      // in case of admin
      let condition = {
        where: {
          status: true,
          order: [["created_on", "DESC"]],
        },
      };
      if (socket.user.id == 1) {
        condition = { order: [["created_on", "DESC"]] };
      }
      let stockSpaces = await MasterStockModel.findAll(condition);
      stockSpaces = jsonFormator(stockSpaces);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "all stock spaces fetched successfully ",
          currentRoute,
          stockSpaces
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
export default masterStockControllers;
