import customerSubscriptionControllers from "../../controllers/dairyControllers/customerSubsctiptions.controller.js"

function subscriptionRouters(io, socket) {
    // to create new subscription for customer  ( which can be created by user , delivery boy or distribution center )
    socket.on("subscription:create", (data) => {
        customerSubscriptionControllers.createNewSubscriptions(data, socket, io, "subscription:create")
    })

    // view all subscriptions subscribed by a customer  
    socket.on("subscription:by-customer", (data) => {
        customerSubscriptionControllers.viewSubscriptions(data, socket, io, "subscription:by-customer")
    })

    // view all subscriptions by distribution center
    socket.on("subscription:all", (data) => {
        customerSubscriptionControllers.viewAllSubscriptionsByDistributionCenter(data, socket, io, "subscription:all")
    })

    // to update a subscription
    socket.on("subscription:update", (data) => {
        customerSubscriptionControllers.updateSubscription(data, socket, io, "subscription:update")
    })
    // to get subscription detail by subscription id
    socket.on("subscription:by-id", (data) => {
        customerSubscriptionControllers.viewSubscriptionById(data, socket, io, "subscription:by-id")
    })
    // stop subscription 
    socket.on("subscription:stop", (data) => {
        customerSubscriptionControllers.stopSubscription(data, socket, io, "subscription:stop")
    })

    // stop all subscription for a perticualr user
    socket.on("subscription:stop-all", (data) => {
        customerSubscriptionControllers.stopAllSubscriptionsOfAUser(data, socket, io, "subscription:stop-all")
    })

    // to change onday quqntity for subscription
    socket.on("subscription:change-qty", (data) => {
        customerSubscriptionControllers.changeOneDayQuantity(data, socket, io, "subscription:change-qty")
    })

    // to reactivate stopped subscription single or multiple
    socket.on("subscription:re-activate", (data) => {
        console.log("hitted => => ")
        customerSubscriptionControllers.reactivateSubscription(data, socket, io, "subscription:re-activate")
    })

    // to reactivate all stopped subscription 
    socket.on("subscription:re-activate-all", (data) => {
        // send the reactivateAll =true to reactivate all stopped subscriptions
        customerSubscriptionControllers.reactivateSubscription({ ...data, reactivateAll: true }, socket, io, "subscription:re-activate-all")
    })


}



export default subscriptionRouters;