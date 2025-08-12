import { masterPaymentStatusController } from "../../controllers/index.controller.js";

function masterPaymentStatusRoute(io, socket) {

    socket.on("ms-payment-status:create", (data) => {
        masterPaymentStatusController.createPaymentStatus(data, socket, io, "ms-payment-status:create");
    });

    socket.on("ms-payment-status:update", (data) => {
        masterPaymentStatusController.updatePaymentStatus(data, socket, io, "ms-payment-status:update");
    });

    socket.on("ms-payment-status:by-id", (data) => {
        masterPaymentStatusController.paymentStatusById(data, socket, io, "ms-payment-status:by-id");
    });

    socket.on("ms-payment-status:all", (data) => {
        masterPaymentStatusController.paymentStatusAll(data, socket, io, "ms-payment-status:all");
    });
}
export default masterPaymentStatusRoute;