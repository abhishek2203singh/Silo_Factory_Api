import { CityModel } from "../model/city.model.js";
import { StateModel } from "../model/state.Model.js";
import { apiResponse } from "../utility/response.util.js";
import { jsonFormator } from "../utility/toJson.util.js";
const locationControllers = {
  // get all states
  async getAllStates(data, socket, io, currentRoute) {
    // console.log("inside all sates =>route => ", currentRoute);
    try {
      let states = await StateModel.findAll();
      states = jsonFormator(states);
      socket.emit(currentRoute, {
        ...apiResponse.success(true, "all states", currentRoute, states),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  //   get state info by state id
  async getStateById({ stateId = false }, socket, io, currentRoute) {
    try {
      if (!stateId) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "state id is required", currentRoute),
        });
      }
      let stateInfo = await StateModel.findOne({
        where: { id: stateId },
      });
      stateInfo = jsonFormator(stateInfo);
      socket.emit(currentRoute, {
        ...apiResponse.success(true, "state", currentRoute, stateInfo),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  //   get all cities by state id
  async getAllCitiesByStateId(data, socket, io, currentRoute) {
    const { stateId } = data;
    // console.log("data", data);
    try {
      let cities = await CityModel.findAll({
        where: {
          state_id: stateId,
        },
        order: [["created_on", "DESC"]],
      });
      cities = jsonFormator(cities);
      socket.emit(currentRoute, {
        ...apiResponse.success(true, "cities", currentRoute, cities),
      });
    } catch (error) {
      socket.emit(currentRoute, {
        ...apiResponse.success(false, "cities", currentRoute, error),
      });
    }
  },
  //   get city info by city id
  async getCityById({ cityId = false }, socket, io, currentRoute) {
    try {
      if (!cityId) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "city id is required", currentRoute),
        });
      }
      let cityInfo = await CityModel.findOne({ where: { id: cityId } });
      cityInfo = jsonFormator(cityInfo);
      socket.emit(currentRoute, {
        ...apiResponse.success(true, "city", currentRoute, cityInfo),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};
export default locationControllers;
