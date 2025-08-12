import { customerControllers } from "../../controllers/index.controller.js"

function customerRouters(io, socket) {


    socket.on("customer:add-subscription", (data) => {
        customerControllers.createNewSubscriptions(data, socket, io, "customer:add-subscription")
    })

    // to create a new customer by self or by distribution center
    socket.on("customer:register", (data) => {
        customerControllers.customerRegistration(data, socket, io, "customer:register")
    });
    socket.on("customer:get-by-distCen-id", (data) => {
        customerControllers.customerGetByDistId(data, socket, io, "customer:get-by-distCen-id")
    });

    // to replace delivery boy
    socket.on("customer:replace-delivery-boy", (data) => {
        customerControllers.replaceDeliveryBoy(data, socket, io, "customer:replace-delivery-boy")
    });
    socket.on("deactivated-customers:get-by-distCen-id", (data) => {
        customerControllers.deactivatedcustomerGetByDistId(data, socket, io, "deactivated-customers:get-by-distCen-id")
    });


}

export default customerRouters;