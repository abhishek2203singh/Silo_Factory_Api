/* eslint-disable no-unused-vars */
import Yup from "yup";
import { apiResponse } from "../utility/response.util.js";
import { PasteurizationInfoModel } from "../model/pasteurizationInfo.model.js";
import { MasterPasteurizationSilosModel } from "../model/masterPasteurizationSilo.model.js";
import { siloUtils } from "../utility/silo.util.js";
import { literal } from "sequelize";
import { jsonFormator } from "../utility/toJson.util.js";
const pasteurizationController = {
  async addMilkRecord(data, socket, io, currentRoute) {
    try {
      const addMilkSchema = Yup.object({
        siloId: Yup.number()
          .typeError("Invalid Quantity. Quantity must be a number.")
          .required("Please select a silo"),
        quantity: Yup.number("Invalid Quantity")
          .typeError("Invalid Quantity. Quantity must be a number.")
          .min(1, "Quantity should be greater than 0")
          .required("Quantity is required"),
        // unit: Yup.string("Invalid unit of measurement").required(
        //   "unit of measurement is required"
        // ),
        // department: Yup.string("Invalid department").required(
        //   "please select department"
        // ),
        // departmentHead: Yup.number("Invalid department head").required(
        //   "please select department head"
        // ),
        transactionType: Yup.string()
          .oneOf(["in", "out"], "Invalid transaction type")
          .required("please select transaction type"),
      });
      // getting values after validation
      const {
        siloId,
        quantity,
        unit,
        department,
        departmentHead,
        transactionType,
      } = await addMilkSchema.validate(data, {
        abortEarly: true,
        stripUnknown: true,
      });
      const milkQuantity =
        transactionType == "in" ? Number(quantity) : Number(quantity * -1);
      console.log("milkQuantity =>", milkQuantity);
      //   check wether entry already exist
      const isAlreadyExists = await PasteurizationInfoModel.findOne({
        where: {
          mst_silos_id: siloId,
          milk_quantity: milkQuantity,
          milk_transfer_type: transactionType,
          created_by: socket.user.id,
        },
      });
      if (isAlreadyExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Milk entry already exists",
            currentRoute,
            ""
          ),
        });
      }
      // check the capacity of selected  silo
      let siloData = await MasterPasteurizationSilosModel.findByPk(siloId);
      // if silo not found
      if (!siloData.status) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `The silo ' ${siloData.silo_name}' is Inactive , please choose another silo or  activate this`
          ),
        });
      }
      if (!siloData) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "silo not exists"),
        });
      }
      // in case of  quantity removing
      if (milkQuantity < 0) {
        const underFlow = siloUtils.underFlow(siloData, milkQuantity);
        console.log("under flow :", underFlow);
        if (underFlow.is) {
          const { currentState } = underFlow;
          return socket.emit(currentRoute, {
            ...apiResponse.error(false, underFlow.message, currentRoute, {
              currentState,
            }),
          });
        }
      }
      // in case of adding more quantity
      if (milkQuantity > 0) {
        console.log("inside if ");
        const overflow = siloUtils.overFlow(siloData, milkQuantity);
        console.log("over flow :", overflow);
        if (overflow.is) {
          const { currentState } = overflow;
          return socket.emit(currentRoute, {
            ...apiResponse.error(false, overflow.message, currentRoute, {
              currentState,
            }),
          });
        }
      }
      let insertResult = await PasteurizationInfoModel.create({
        mst_silos_id: siloId,
        milk_quantity: milkQuantity,
        milk_transfer_type: transactionType,
        created_by: socket.user.id,
      });
      if (!insertResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "Error while adding milk", currentRoute),
        });
      }
      insertResult = jsonFormator(insertResult);
      // update avaialble milk quantity in silos
      console.log("insertResult =>", insertResult);
      const updatedResult = await MasterPasteurizationSilosModel.update(
        {
          total_available_milk: literal(
            `total_available_milk+${insertResult.milk_quantity}`
          ),
        },
        {
          where: {
            id: siloId,
          },
        }
      );
      if (!updatedResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "Error while adding milk", currentRoute),
        });
      }
      //   update
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Record seved successfully !",
          currentRoute
        ),
      });
    } catch (error) {
      // if any validation error
      if (error instanceof Yup.ValidationError) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            error.message,
            error.message,
            currentRoute
          ),
        });
      }
      console.error(error);
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error.message),
      });
    }
  },
  async fetchDatabySilodprtId(data, socket, io, currentRoute) {
    try {
      // get user id from data
      const { silDId } = data;
      console.log("Silo department id =>", silDId);
      let silosdprtResult = await PasteurizationInfoModel.findOne({
        where: { id: silDId },
        // attributes: {
        //   exclude: [
        //     "approvalstatus_id",
        //     "approval_by",
        //     "payment_status_to_vendor",
        //     "status",
        //     "created_by",
        //     "created_on",
        //     "updated_by",
        //     "updated_on",
        //   ],
        // },
      });
      silosdprtResult = jsonFormator(silosdprtResult);
      //   if user not exists
      if (!silosdprtResult) {
        return socket.emit(
          currentRoute,
          ...apiResponse.error(
            false,
            "Quality Control not found !",
            currentRoute
          )
        );
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Silos department fetched ",
          currentRoute,
          silosdprtResult
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async getAllMilkRecords(data, socket, io, currentRoute) {
    try {
      // get all milk records from
      const result = await PasteurizationInfoModel.findAll({
        order: [["created_on", "DESC"]],
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};
export default pasteurizationController;

