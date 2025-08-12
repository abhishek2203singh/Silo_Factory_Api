import { qualitycontrolcontroller } from "../controllers/index.controller.js";
// import { auth } from "../middlewares/auth.middleware.js";
// import { apiResponse } from "../utility/response.util.js";

const qualityControlRouter = (io, socket) => {
  // route for Vendor Report By Vendorid
  socket.on("Report:vendorByid", async (data) => {
    qualitycontrolcontroller.reportvendorbyid(
      data,
      socket,
      io,
      "Report:vendorByid"
    );
  });

  // route for user fist Entry Vendor Goods and check Quality Check then in Factory
  socket.on("vendor:entrygoods", async (data) => {
    qualitycontrolcontroller.InsertQcData(
      data,
      socket,
      io,
      "vendor:entrygoods"
    );
  });

  socket.on("quality:fetchtable", async (data) => {
    qualitycontrolcontroller.fetchqualitycontrolbyLoggedInUser(
      data,
      socket,
      io,
      "listen:Quality_Control"
    );
  });

  socket.on("quality:fetchtablebyvendorId", async (data) => {
    qualitycontrolcontroller.fetchqualitycontrolbyvendorId(
      data,
      socket,
      io,
      "quality:fetchtablebyvendorId",
      socket.user.id
    );
  });

  socket.on("quality:get-vendor-by-id", async (data) => {
    qualitycontrolcontroller.getVendorforQualityById(
      data,
      socket,
      io,
      "quality:get-vendor-by-id"
    );
  });

  socket.on("quality:get-vendordata-by-id", async (data) => {
    qualitycontrolcontroller.getVendorDataById(
      data,
      socket,
      io,
      "quality:get-vendordata-by-id"
    );
  });

  socket.on("quality:update", async (data) => {
    console.log("quality:update =>", data);
    qualitycontrolcontroller.updateQualityDtls(
      data,
      socket,
      io,
      "quality:update"
    );
  });
  socket.on("quality:delete-vendor-by-id", async (data) => {
    qualitycontrolcontroller.deleteVendorForQualityById(
      data,
      socket,
      io,
      "quality:delete-vendor-by-id"
    );
  });

  socket.on("quality:fetchqualitycontrolbyId", async (data) => {
    qualitycontrolcontroller.fetchqualitycontrolbyId(
      data,
      socket,
      io,
      "quality:fetchqualitycontrolbyId"
    );
  });

  socket.on("quality:qc-approval-by-Id", async (data) => {
    qualitycontrolcontroller.qcapprovalbyId(
      data,
      socket,
      io,
      "quality:qc-approval-by-Id"
    );
  });

  socket.on("quality:get-invoice-by-date", async (data) => {
    qualitycontrolcontroller.getVendorDataByDate(
      data,
      socket,
      io,
      "quality:get-invoice-by-date"
    );
  });
};
export default qualityControlRouter;
