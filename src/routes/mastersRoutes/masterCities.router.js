import { masterCityController } from "../../controllers/index.controller.js";

function masterCitiesRoute(io, socket) {
    socket.on("ms-cities:create", (data) => {
        masterCityController.createCities(data, socket, io, "ms-cities:create");
    });
    socket.on("ms-cities:update", (data) => {
        masterCityController.updateCities(data, socket, io, "ms-cities:update");
    });

    socket.on("ms-cities:by-id", (data) => {
        masterCityController.citiesById(data, socket, io, "ms-cities:by-id");
    });
    socket.on("ms-cities:all", (data) => {
        masterCityController.allCities(data, socket, io, "ms-cities:all");
    });

}
export default masterCitiesRoute