import Yup from "yup";
import { MasterDistributionCentersModel } from "../../model/masterDistributionCenter.model.js";
import { MasterDistributionCenterViewModel } from "../../model/views/masterDistributionCenterView.model.js";
import { apiResponse } from "../../utility/response.util.js";
import { distributionCenterSchema } from "../../yup-schemas/masterDistributionCenter.schema.js";
import { jsonFormator } from "../../utility/toJson.util.js";
import { customMessage } from "../../utility/messages.util.js";
import { idSchema } from "../../yup-schemas/idSchema.schema.js";
import { Op } from "sequelize";
const masterDistributionCenterControllers = {
  // create new Distibution Center
  async createDistibutionCenter(data, socket, io, currentRoute) {
    try {
      const {
        centerName,
        centerCode,
        pincode,
        city,
        state,
        manager,
        address,
        mobile,
        email,
      } = await distributionCenterSchema.validate(data, {
        abortEarly: true,
        striptUnknow: true,
      });
      console.table(data);

      //  identify if distribution center with given name already  exists

      const existingStockSpace = await MasterDistributionCentersModel.findOne({
        where: {
          center_name: centerName,
          center_code: centerCode,
          mobile,
          email,
        },
      });
      if (existingStockSpace) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Distibution Center ' ${centerName} ' already exists`,
            currentRoute,
            ""
          ),
        });
      }
      const [existingMobile, existingEmail, existingCenterCode] =
        await Promise.all([
          MasterDistributionCentersModel.findOne({ where: { mobile } }),
          MasterDistributionCentersModel.findOne({ where: { email } }),
          MasterDistributionCentersModel.findOne({
            where: { center_code: centerCode },
          }),
        ]);
      console.log("center code =>", existingCenterCode);
      if (existingCenterCode || existingMobile || existingEmail) {
        const message = existingEmail
          ? "email"
          : existingCenterCode
            ? "Center Code"
            : "Mobile No";
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            message + customMessage.exists,
            currentRoute,
            ""
          ),
        });
      }
      // if Distibution Center exists already
      if (existingStockSpace) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Distibution Center ' ${centerName} ' already exists`,
            currentRoute,
            ""
          ),
        });
      }
      // to check whehere provide is a object or not
      if (typeof data !== "object" || data === null) {
        throw new Yup.ValidationError("Please check your inputs !");
      }
      let creteStockSpace = await MasterDistributionCentersModel.create({
        center_name: centerName,
        center_code: centerCode,
        state,
        city,
        pincode,
        manager_or_owner: manager,
        address,
        mobile,
        email,
        is_deletable: true,
        created_by: socket.user.id,
      });
      creteStockSpace = jsonFormator(creteStockSpace);
      if (!creteStockSpace) {
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
          `Distribution Center '${centerName}' created successfully `,
          currentRoute
        ),
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, error.message, currentRoute, error),
        });
      }
      console.log(error);
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  // get Distibution Center by id
  async getDistibutionCenterById(data, socket, io, currentRoute) {
    try {
      const { id } = await idSchema.validate(data);
      //   Distibution Center by id
      let stockSpaceResult = await MasterDistributionCenterViewModel.findOne({
        attributes: {
          exclude: [
            "created_on",
            "updated_on",
            "created_by",
            "updated_by",
            "is_deletable",
          ],
        },
        where: {
          id: id,
        },
      });
      //   if stock space not found
      if (!stockSpaceResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Distibution Center" + customMessage.notEx,
            currentRoute
          ),
        });
      }
      stockSpaceResult = jsonFormator(stockSpaceResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Distibution Center " + customMessage.fetched,
          currentRoute,
          stockSpaceResult
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
  //   update Distibution Center
  async updateDistibutionCenter(data, socket, io, currentRoute) {
    try {
      console.table(data);
      const updateStockSpaceSchema = distributionCenterSchema.concat(idSchema);
      const {
        id,
        centerName,
        centerCode,
        city,
        state,
        manager,
        address,
        mobile,
        pincode,
        email,
      } = await updateStockSpaceSchema.validate(data);

      //  check wether stock space exists or not

      let isExists = await MasterDistributionCentersModel.findByPk(id);

      // if stock space  not found
      if (!isExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Distribution center not found`,
            currentRoute
          ),
        });
      }
      const [existingMobile, existingEmail, existingCenterCode] =
        await Promise.all([
          MasterDistributionCentersModel.findOne({
            where: { mobile, id: { [Op.ne]: id } },
          }),
          MasterDistributionCentersModel.findOne({
            where: { email, id: { [Op.ne]: id } },
          }),
          MasterDistributionCentersModel.findOne({
            where: { center_code: centerCode, id: { [Op.ne]: id } },
          }),
        ]);
      if (existingCenterCode || existingMobile || existingEmail) {
        const message = existingEmail
          ? "email"
          : existingCenterCode
            ? "Center Code"
            : "Mobile No";
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            message + customMessage.exists,
            currentRoute,
            ""
          ),
        });
      }
      // if Distributio center is can't be modified
      if (!isExists?.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Distribution center '${isExists?.center_name}' ` +
            customMessage.cantModify
          ),
        });
      }
      //   update user role
      const [updateResult] = await MasterDistributionCentersModel.update(
        {
          center_name: centerName,
          center_code: centerCode,
          state,
          city,
          manager_or_owner: manager,
          address,
          mobile,
          email,
          pincode,
          created_by: socket.user.id,
          updated_by: socket.user.id,
        },
        {
          where: {
            id: id,
          },
        }
      );
      //   if Distributio center updated in case of updateResult == 0
      if (!updateResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Distributio center '${centerName}' not updated `,
            currentRoute
          ),
        });
      }
      // updated successfully
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Distribution Center " + customMessage.updSucc,
          currentRoute
        ),
      });
      this.getAllDistibutionCenters(
        data,
        socket,
        io,
        "ms-disribution-center:all"
      );
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, error.message, currentRoute, error),
        });
      }
      console.log(error);
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  // delete Distibution Center
  async deleteDistibutionCenter(data, socket, io, currentRoute) {
    try {
      console.log("data =>", data);

      const { id } = await idSchema.validate(data);

      let distributionCenterDetails =
        await MasterDistributionCentersModel.findByPk(id);
      // if distribution center not found
      if (!distributionCenterDetails) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "distribution center does not exists",
            currentRoute
          ),
        });
      }
      distributionCenterDetails = jsonFormator(distributionCenterDetails);
      if (!distributionCenterDetails.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `Distribution center ' ${distributionCenterDetails.center_name} '` +
            customMessage.cantModify
          ),
        });
      }

      //   other wise change status to false

      const [deleteResult] = await MasterDistributionCentersModel.update(
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
            ` Stock space ${distributionCenterDetails?.center_name} is not deleted !`,
            currentRoute
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Distribution center ' ${distributionCenterDetails.center_name} ' has been deleted successfully ! `,
          currentRoute
        ),
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        console.log(error);
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, error.message, currentRoute, error),
        });
      }
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  //   to get all Distibution Centers
  async getAllDistibutionCenters(data, socket, io, currentRoute) {
    try {
      // in case of admin
      let condition = {
        order: [["created_on", "DESC"]],
        where: {
          status: true,
        },
      };
      if (socket.user.id == 1) {
        condition = { order: [["created_on", "DESC"]] };
      }
      let stockSpaces = await MasterDistributionCenterViewModel.findAll(condition);
      stockSpaces = jsonFormator(stockSpaces);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Distribution centers " + customMessage.fetched,
          currentRoute,
          stockSpaces
        ),
      });
    } catch (error) {
      //   if (error instanceof Yup.ValidationError) {
      //     return socket.emit(currentRoute, {
      //       ...apiResponse.error(false, error.message, currentRoute, error),
      //     });
      //   }
      //   if (error instanceof Yup.ValidationError) {
      //     return socket.emit(currentRoute, {
      //       ...apiResponse.error(false, error.message, currentRoute, error),
      //     });
      //   }
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};

export default masterDistributionCenterControllers;
