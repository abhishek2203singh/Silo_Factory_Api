import { unitControllers } from "../controllers/index.controller.js";

const unitRouters = (io, socket) => {
    // route for user registration
    socket.on("ms-unit:all", async (data) => {
        unitControllers.getAllUnit(data, socket, io, "ms-unit:all");
    });

    // api to get all supported units for the product 
    socket.on("ms-unit:supported-units", async (data) => {
        unitControllers.getAllSupportedUnitsByProductId(data, socket, io, "ms-unit:supported-units");
    });

    // get all possible conversion units by unit id
    socket.on("ms-unit:possible-conversions", async (data) => {
        unitControllers.getAllPossibleUnitConversions(data, socket, io, "ms-unit:possible-conversions");
    });


};
export default unitRouters;

// Import user routes and apply them to the socket.io server
