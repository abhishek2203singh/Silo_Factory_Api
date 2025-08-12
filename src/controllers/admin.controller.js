import Yup from "yup";
import { apiResponse } from "../utility/response.util.js";
import { UserModel } from "../model/user.model.js";
import { MasterPasteurizationSilosModel } from "../model/masterPasteurizationSilo.model.js";
import { MasterSilosModel } from "../model/masterSilos.model.js";
import { ProductModel } from "../model/product.model.js";
import { QualityApprovalManagerWithAdmin } from "../model/qualityApprovalMngAd.model.js";
import { MasterDistributionCentersModel } from "../model/masterDistributionCenter.model.js";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
const adminControllers = {
  async getALlDashboardData(data, socket, io, currentRoute) {
    try {
      //   let [totalEmployees,totalVendors,pasteurizadMilk,rowMilk,totalProducts,totalPaymetns,pendingApprovals,totalDepatments,totalSilos,totalStock]
      const [
        totalEmployees,
        totalDeliveryboy,
        totalVendors,
        pasteurizadMilk,
        roughMilk,
        totalProducts,
        totalMasterSilos,
        totalPsSilos,
        pendingApprovals,
        totalDistributionCenters,
        totalDepatments,
      ] = await Promise.all([
        UserModel.count({ where: { role_id: 9 } }),
        UserModel.count({ where: { role_id: 5 } }),
        UserModel.count({ where: { role_id: 7 } }),
        MasterPasteurizationSilosModel.aggregate("total_available_milk", "sum"),
        MasterSilosModel.aggregate("total_available_milk", "sum"),
        ProductModel.count(),
        MasterSilosModel.count(),
        MasterPasteurizationSilosModel.count(),
        QualityApprovalManagerWithAdmin.count({
          where: { approval_status_id: 1 },
        }),
        MasterDistributionCentersModel.count(),
        MasterDepartmentModel.count(),
      ]);
      socket.emit(currentRoute, {
        ...apiResponse.success(true, "success", currentRoute, {
          totalEmployees,
          totalDeliveryboy,
          totalVendors,
          pasteurizadMilk,
          roughMilk,
          totalMilk: pasteurizadMilk + roughMilk,
          totalProducts,
          totalMasterSilos, // total silos in silos department
          totalPsSilos, // means total pasteurization silos
          pendingApprovals,
          totalDistributionCenters,
          totalDepatments,
          totalSilos: totalMasterSilos + totalPsSilos,
        }),
      });
    } catch (error) {
      //console.error(error);
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
export default adminControllers;
