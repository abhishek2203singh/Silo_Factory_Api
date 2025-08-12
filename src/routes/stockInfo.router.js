import { stockInfoControllers } from "../controllers/index.controller.js";

function stockInfoRouters(io, socket) {
    // to add / remove products from stock space
    socket.on("stock-info:add", (data) => {
        stockInfoControllers.insertInStockSpace(data, socket, io, "stock-info:add");
    });

    // to accept stock from any department
    socket.on("stock-info:accept-stock", (data) => {
        stockInfoControllers.acceptStock(
            data,
            socket,
            io,
            "stock-info:accept-stock"
        );
    });

    //process stock out 
    socket.on("stock-info:stock-out", (data) => {
        stockInfoControllers.processStockOut(
            data,
            socket,
            io,
            "stock-info:stock-out"
        );
    });

    //   to view all inventories according to logged in user's department
    socket.on("stock-info:inventories", (data) => {
        stockInfoControllers.allInventoriesByDepartment(data, socket, io, "stock-info:inventories");
    });

    // view list of all products which you have in stock accoriding to login department

    socket.on("stock-info:product-list", (data) => {
        stockInfoControllers.listOfAvalilableProducts(data, socket, io, "stock-info:product-list");
    });

    // to view packing sizes according to provided product id and logged in user's department
    socket.on("stock-info:packing-size", (data) => {
        stockInfoControllers.stockProductsPackingSizes(data, socket, io, "stock-info:packing-size");
    })



}

export default stockInfoRouters;
