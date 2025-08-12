import { deliveryBoyController } from '../../controllers/index.controller.js'
const deliveryBoyRoute = (io, socket) => {
    socket.on("user:get-delivery-boy", (data) => {
        deliveryBoyController.getDeliveryBoy(data, socket, io, "user:get-delivery-boy")
    });
    socket.on("user:get-delivery-boy-by-id", (data) => {
        deliveryBoyController.getDeliveryBoyById(data, socket, io, "user:get-delivery-boy-by-id")
    });
    socket.on("user:deactive-delivery-boy-by-id", (data) => {
        deliveryBoyController.deactiveDeliveryBoyById(data, socket, io, "user:deactive-delivery-boy-by-id")
    });
    socket.on("customer-deliveryBoy:map-delivery-to-customer", (data) => {
        deliveryBoyController.assignDeliveryboyToCstmr(data, socket, io, "customer-deliveryBoy:map-delivery-to-customer")
    });
    socket.on("user:get-customer-by-delivery-boy", (data) => {
        deliveryBoyController.getCustomerByDeliveryBoy(data, socket, io, "user:get-customer-by-delivery-boy")
    });
    // customer quantity change
    socket.on("Customer_Orders:scheduled-quantity-change-by-dlboy", (data) => {
        deliveryBoyController.scheduledQtyChangeByDLBoy(data, socket, io, "Customer_Orders:scheduled-quantity-change-by-dlboy")
    });
    // delivery boy create customer
    /* socket.on("user:add-customer-by-dlboy", (data) => {
         deliveryBoyController.createCustomerByDeliveryBoy(data, socket, io, "user:add-customer-by-dlboy")
     })*/
}
export default deliveryBoyRoute;