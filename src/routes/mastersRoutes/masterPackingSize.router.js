import { masterPackingSizeConroller } from "../../controllers/index.controller.js";

function packingUnitRoute(io, socket) {
  socket.on("ms-packing-size:create", (data) => {
    masterPackingSizeConroller.createPackagingSize(
      data,
      socket,
      io,
      "ms-packing-size:create"
    );
  });
  socket.on("ms-packing-size:update", (data) => {
    masterPackingSizeConroller.updatePackingSize(
      data,
      socket,
      io,
      "ms-packing-size:update"
    );
  });
  socket.on("ms-packing-size:by-id", (data) => {
    masterPackingSizeConroller.getPackingSizeById(
      data,
      socket,
      io,
      "ms-packing-size:by-id"
    );
  });
  socket.on("ms-packing-size:by-product-id", (data) => {
    masterPackingSizeConroller.getPackingSizesByProductId(
      data,
      socket,
      io,
      "ms-packing-size:by-product-id"
    );
  });

  //   get all packing sizes of all products
  socket.on("ms-packing-size:all", (data) => {
    masterPackingSizeConroller.getAllPackingSizes(
      data,
      socket,
      io,
      "ms-packing-size:all"
    );
  });
}
export default packingUnitRoute;
