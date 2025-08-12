import locationControllers from "../controllers/location.controller.js";

const locationRouter = (io, socket) => {
  // api to get all states
  socket.on("location:states", async (data) => {
    locationControllers.getAllStates(data, socket, io, "location:states");
  });

  //  api to get state info by state id

  socket.on("location:state-info", async (data) => {
    locationControllers.getStateById(data, socket, io, "location:state-info");
  });

  //   api to get all cities by state id
  socket.on("location:cities", async (data) => {
    locationControllers.getAllCitiesByStateId(
      data,
      socket,
      io,
      "location:cities"
    );
  });

  // api to get city info by city id

  socket.on("location:city-info", async (data) => {
    locationControllers.getCityById(data, socket, io, "location:city-info");
  });
};

export default locationRouter;
