import { approvalControllers } from "../controllers/index.controller.js";
const approvalRouter = (io, socket) => {
  socket.on("approval:detailsbyid", async (data) => {
    approvalControllers.detailsapprovalbyId(
      data,
      socket,
      io,
      "approval:detailsbyid"
    );
  });
  // socket.on("approval:mastapproval", async (data) => {
  //   approvalControllers.masterapproval(
  //     data,
  //     socket,
  //     io,
  //     "approval:mastapproval"
  //   );
  // });

  socket.on("approval:insert-update-approval", async (data) => {
    approvalControllers.insertupdateapproval(
      data,
      socket,
      io,
      "approval:insert-update-approval"
    );
  });

  //   to handle approval staus chnge by destination
  socket.on("approval:change-destination-approval-status", async (data) => {
    approvalControllers.updateApprovalStatusByDestination(
      data, socket, io, "approval:change-destination-approval-status"
    );
  });
};

export default approvalRouter;
