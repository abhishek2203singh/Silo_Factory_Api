import masterAlertControllers from "../../controllers/masterControllers/masterAlert.controller.js";
const masterAlertRouters = (io, socket) => {
  // ***************************************************** Routes for alert-type **************************
  // create a new alert type
  socket.on("ms-alert-type:create", (data) => {
    masterAlertControllers.createAlertType(
      data,
      socket,
      io,
      "ms-alert-type:create"
    );
  });

  //   update alert-type
  socket.on("ms-alert-type:update", (data) => {
    masterAlertControllers.updateAlertType(
      data,
      socket,
      io,
      "ms-alert-type:update"
    );
  });

  //   get alert-type by id
  socket.on("ms-alert-type:by-id", (data) => {
    masterAlertControllers.getAlertTypeById(
      data,
      socket,
      io,
      "ms-alert-type:by-id"
    );
  });

  //   delete alert-type

  socket.on("ms-alert-type:delete", (data) => {
    masterAlertControllers.deleteAlertType(
      data,
      socket,
      io,
      "ms-alert-type:delete"
    );
  });
};

export default masterAlertRouters;
