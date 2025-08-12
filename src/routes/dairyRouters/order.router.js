import { customerOrderControllers } from "../../controllers/index.controller.js"
function orderRouters(io, socket) {

    // to create a new order
    socket.on("customer-order:create", (data) => {
        console.log("customer", data)
        customerOrderControllers.addNewOrder(data, socket, io, "customer-order:create")
    })
    // to cancel order ( customer will cancel)
    socket.on("customer-order:cancel", (data) => {
        customerOrderControllers.cancelOrder(data, socket, io, "customer-order:cancel")
    })
    // view all orders
    socket.on("customer-order:all", (data) => {
        customerOrderControllers.allOrders(data, socket, io, "customer-order:all")
    })

    socket.on("customer-order:change-delivery-status", (data) => {
        customerOrderControllers.changeDeliveryStatus(data, socket, io, "customer-order:change-delivery-status")
    })

    // to assign / replace delivery boy
    socket.on("customer-order:assign-delivery-boy", (data) => {
        customerOrderControllers.assignDeliveryBoy(data, socket, io, "customer-order:assign-delivery-boy")
    })

}

export default orderRouters