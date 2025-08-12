import getAllInventoryData from "../controllers/inventory.controller.js";

function inventoryRouter(io, socket) {

    // get all inventory
    socket.on("inventory:all", (data) => {
        getAllInventoryData.inventoryData(data, socket, io, "inventory:all")
    });

    // total available silo milk
    socket.on("inventory:total-available-silo-milk", (data) => {
        getAllInventoryData.totalAvailableSiloMilk(data, socket, io, "inventory:total-available-silo-milk")
    });

}

export default inventoryRouter;