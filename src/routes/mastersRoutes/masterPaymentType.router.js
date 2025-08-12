import { masterPaymentTypeController } from '../../controllers/index.controller.js'
function masterPaymentTyperoute(io, socket) {

    // create payment type ===============
    socket.on("ms-payment-type:create", (data) => {
        masterPaymentTypeController.createPaymentType(data, socket, io, "ms-payment-type:create")
    });
    // update payment type ==============
    socket.on("ms-payment-type:update", (data) => {
        masterPaymentTypeController.updatePaymentType(data, socket, io, "ms-payment-type:update")
    });

    // getById payment type 

    socket.on("ms-payment-type:by-id", (data) => {
        masterPaymentTypeController.getPaymentTypeById(data, socket, io, "ms-payment-type:by-id")
    });

    // get all payment type
    socket.on("ms-payment-type:all", (data) => {
        masterPaymentTypeController.getAllPaymentType(data, socket, io, "ms-payment-type:all")
    });

}
export default masterPaymentTyperoute;