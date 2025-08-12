import { pasteurizationSiloControllers } from "../controllers/index.controller.js";

const pasteurizationSiloRouter = (io, socket) => {
  // route for user registration
  // routes to pasteurization silo start with  => ps-silo

  // get all entries of the pasteurization silo  // pasteurization-info table
  socket.on("ps-silo:all", async (data) => {
    pasteurizationSiloControllers.getAllMilkRecords(
      data,
      socket,
      io,
      "ps-silo:all"
    );
  });

  //   the record will be inserted into pasteurization-info table
  socket.on("ps-silo:add", async (data) => {
    pasteurizationSiloControllers.insertInSilo(data, socket, io, "ps-silo:add");
  });

};

export default pasteurizationSiloRouter;
