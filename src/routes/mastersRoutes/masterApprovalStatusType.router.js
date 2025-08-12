import  masterApprovalStatusControllers  from "../../controllers/masterControllers/masterApprovalStsType.controller.js";

function masterApprovalStatusRouters(io, socket) {
  // to get all master approval status types
  socket.on("ms-approval-status:all", (data) => {
    masterApprovalStatusControllers.getAllApprovelStatusTypes(
      data,
      socket,
      io,
      "ms-approval-status:all"
    );
  });

  //   create new approval staus type
  socket.on("ms-approval-status:create", (data) => {
    masterApprovalStatusControllers.createApprovelStatusType(
      data,
      socket,
      io,
      "ms-approval-status:create"
    );
  });

  //   update master approval status type
  socket.on("ms-approval-status:update", (data) => {
    masterApprovalStatusControllers.updateApprovelStatusType(
      data,
      socket,
      io,
      "ms-approval-status:update"
    );
  });

  //   delete master approval status type
  socket.on("ms-approval-status:delete", (data) => {
    masterApprovalStatusControllers.deleteApprovelStatusType(
      data,
      socket,
      io,
      "ms-approval-status:delete"
    );
  });

  //   get master approval status type by id
  socket.on("ms-approval-status:by-id", (data) => {
    masterApprovalStatusControllers.getApprovalStatusTypeById(
      data,
      socket,
      io,
      "ms-approval-status:by-id"
    );
  });
}

export default masterApprovalStatusRouters;
