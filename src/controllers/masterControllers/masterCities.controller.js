import Yup from 'yup';
import { MasterCities } from '../../model/masterCities.model.js';
import { apiResponse } from '../../utility/response.util.js';
import { customMessage } from '../../utility/messages.util.js';
import { jsonFormator } from '../../utility/toJson.util.js';
import locationControllers from '../location.controller.js';
const masterCityController = {
    async createCities(data, socket, io, currentRoute) {
        try {
            const citySchema = Yup.object({
                cityName: Yup.string().required('Please, enter city name!!'),
                priorityLevel: Yup.string().oneOf(['permanent', 'temporary'], "Please select city priority level like , permanent or temporary").default("temporary"),
                stateId: Yup.number().required('Please, select state !!')
            });
            const { cityName, priorityLevel, stateId } = await citySchema.validate(data);
            const cityExists = await MasterCities.findOne({
                where: {
                    name: cityName,
                    state_id: stateId
                }
            });
            if (cityExists) {
                return socket.emit("error", {
                    ...apiResponse.error(false, `City name ${cityName} already exists !!`)
                });
            }
            let cityResult = await MasterCities.create({
                name: cityName,
                state_id: stateId,
                is_deletable: priorityLevel == 'permanent' ? false : true
            });
            if (!cityResult) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "City not created !!")
                });
            }
            cityResult = jsonFormator(cityResult);
            socket.emit(currentRoute, {
                ...apiResponse.success(true, `City ${cityName} created successfully!!`, currentRoute, cityResult)
            });
            locationControllers.getAllCitiesByStateId(
                { stateId },
                socket,
                io,
                "location:cities"
            );


        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error)
            })
        }
    },
    async updateCities(data, socket, io, currentRoute) {
        console.log("hjdsj", data);
        try {
            const citySchema = Yup.object({
                cityId: Yup.number(customMessage.badReq).required(customMessage.badReq),
                stateId: Yup.number(),
                cityName: Yup.string().required("Please, Enter city name!!"),
                priorityLevel: Yup.string().oneOf(['permanent', 'temporary'], "Please select city priority level like , permanent or temporary").default("temporary"),
            });
            const { cityId, stateId, cityName, priorityLevel } = await citySchema.validate(data);
            const cityDataExists = await MasterCities.findOne({
                where: {
                    state_id: stateId,
                    name: cityName
                }
            });
            if (cityDataExists) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, 'City Name Already Exits, Duplicate Entry!!', currentRoute)
                })
            }
            let [cityUpdateResult] = await MasterCities.update({
                name: cityName,
                is_deletable: priorityLevel == 'permanent' ? false : true
            },
                {
                    where: {
                        id: cityId
                    }
                }
            );
            if (!cityUpdateResult) {
                socket.emit(currentRoute, {
                    ...apiResponse.error(false, "City not modified!!")
                })
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, `City name ${cityName} modified successfully!!`, currentRoute, cityUpdateResult)
            });
            locationControllers.getAllCitiesByStateId(
                data,
                socket,
                io,
                "location:cities"
            );
            masterCityController.citiesById(data, socket, io, "ms-cities:by-id");
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error)
            })
        }
    },
    async citiesById(data, socket, io, currentRoute) {
        try {
            const { cityId = false } = data;
            if (!cityId || cityId < 1) {
                return socket.emit("error", {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute)
                })
            }
            let cityById = await MasterCities.findOne({
                where: {
                    id: cityId
                }
            });
            if (!cityById) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "City not found!!", currentRoute)
                });
            }
            cityById = jsonFormator(cityById);
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "City fetched successfully !!", currentRoute, cityById)
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error)
            })
        }
    }
};
export default masterCityController;
