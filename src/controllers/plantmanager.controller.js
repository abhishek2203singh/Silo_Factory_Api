import { VkQulityApprovalMngAdm } from "../model/views/QulityApprovalMngAdmView.model.js";
import { apiResponse } from "../utility/response.util.js";
import { sequelize } from "../config/dbConfig.js";
import { isValidDate } from "../utility/dateChecker.js";
import moment from "moment";
const plantmanagerControllers = {
  // get all product in database
  async allapproval(data, socket, io, currentRoute) {
    try {
      let { date = false } = data; // date


      if (date) {
        if (!isValidDate) {
          return socket.emit(currentRoute, {
            ...apiResponse.error(
              false,
              "Invalid date",
              currentRoute,
              "Please select a valid date"
            ),
          });
        }
        date = moment(date).format('YYYY-MM-DD');

      }



      console.table({
        "approvals for Date": date
      })
      const query = {
        order: [["created_on", "DESC"]],
        ...(date && {
          where: sequelize.where(
            sequelize.fn('DATE', sequelize.col('date')),
            date
          ),
        }),
      };


      const approvaldetails = await VkQulityApprovalMngAdm.findAll(query);



      // console.log({approvaldetails})
      socket.emit("allapproval", {
        ...apiResponse.success(
          true,
          "product data",
          currentRoute,
          approvaldetails
        ),

      });

      socket.emit("approval:all", {
        ...apiResponse.success(
          true,
          "product data",
          currentRoute,
          approvaldetails
        ),
      });
    } catch (error) {
      console.error("error =>", error);
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};
export default plantmanagerControllers;

