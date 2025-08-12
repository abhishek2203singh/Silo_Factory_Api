import pasteurizationController from "../controllers/pasteurization.controller.js";

const pasteurizationRouter = (io, socket) => {
  // route for user registration
  // routes to pasteurization silo start with  => ps-silo

  // get all entries of the pasteurization silo  // pasteurization-info table
  socket.on("ps-silo:all", async (data) => {
    pasteurizationController.getAllMilkRecords(data, socket, io, "ps-silo:all");
  });

  //   the record will be inserted into pasteurization-info table
  socket.on("ps-silo:add", async (data) => {
    pasteurizationController.addMilkRecord(data, socket, io, "ps-silo:add");
  });
};

export { pasteurizationRouter };
