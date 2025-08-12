import { apiResponse } from "../utility/response.util.js";
import { UserModel } from "../model/user.model.js";
import { jsonFormator } from "../utility/toJson.util.js";
const vendorProductController = {
  // get all product in database
  async getProductByVendorId(data, socket, io, currentRoute) {
    const { role_id } = data;
    //console.log("data", data)
    try {
      let vendorResult = await UserModel.findAll({
        where: {
          role_id,
        },
      });
      vendorResult = jsonFormator(vendorResult);
      // console.log(vendorResult, "sjkdfshdfjh")
      socket.emit(currentRoute, {
        ...apiResponse.success(true, "vendor data", currentRoute, vendorResult),
      });
    } catch (error) {
      console.error("error =>", error);
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};

export default vendorProductController;
