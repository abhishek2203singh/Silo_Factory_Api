import { Op } from "sequelize";
import { QualityControlModel } from "../model/qualityControl.model.js";
import { apiResponse } from "../utility/response.util.js";
import { SiloDepartmentModal } from "../model/silodDepartment.modal.js";
import { MasterSilosModel } from "../model/masterSilos.model.js";
import { PasteurizationDptModel } from "../model/pasteurizationDpt.model.js";

// format full day date format

function formatFullDayDate(date) {
    const startofDay = new Date(date + "T00:00:00.000Z");
    const endToDay = new Date(date + "T23:59:59.000Z");
    return {
        [Op.gte]: startofDay, [Op.lte]: endToDay
    }
};


const getAllInventoryData = {

    async inventoryData(data, socket, io, currentRoute) {
        try {
            const { fromDate, tillDate } = data;
            // create date filter object
            let dateFilter = null
            if (fromDate && tillDate) {
                dateFilter = { [Op.gte]: fromDate, [Op.lte]: new Date(tillDate + "T23:59:59.000Z") }
            }
            if (!fromDate && tillDate) {
                dateFilter = formatFullDayDate(tillDate);
            }
            // create a querry function
            const getSumQuerry = (modelName, condition = {}) => {
                const whereCondition = {
                    ms_product_type_id: 1,
                    ...condition
                }
                if (dateFilter) {
                    whereCondition.date = dateFilter;
                }
                return modelName.sum("quantity", {
                    where: whereCondition,
                })
            }
            // run all condition
            const [vendorRawMilk, totalSiloIncommingMilk, totalSiloOutgoingMilk, totalPasteurizationIncommingMilk, totalPasteurizationRequestedMilk, totalPasteurizationOutgoingMilk] = await Promise.all([
                getSumQuerry(QualityControlModel),
                getSumQuerry(SiloDepartmentModal, { entry_type_id: 3 }),
                getSumQuerry(SiloDepartmentModal, { entry_type_id: 2 }),
                getSumQuerry(PasteurizationDptModel, { entry_type_id: 3 }),
                getSumQuerry(PasteurizationDptModel, { entry_type_id: 2 }),
                getSumQuerry(PasteurizationDptModel, { entry_type_id: 4 }),
            ]);
            if (!vendorRawMilk && !totalSiloIncommingMilk && !totalSiloOutgoingMilk) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "No Data Found !!", currentRoute) });
            }
            // print result 
            return socket.emit(currentRoute, {
                ...apiResponse.success(true, "Data Found !!", currentRoute,
                    {
                        vendorRawMilk,
                        totalSiloIncommingMilk,
                        totalSiloOutgoingMilk,
                        totalPasteurizationIncommingMilk,
                        totalPasteurizationRequestedMilk,
                        totalPasteurizationOutgoingMilk
                    })
            });

        } catch (error) {
            console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },

    // total available silo milk
    async totalAvailableSiloMilk(data, socket, io, currentRoute) {
        try {
            // current stock in silo 
            let availableQtyInSilo
            availableQtyInSilo = await MasterSilosModel.sum("total_available_milk", {
                where: { status: true }
            })
            if (!availableQtyInSilo) {
                return socket.emit(currentRoute, { ...apiResponse.error(false, "No Data Found !!", currentRoute) });
            }
            // print result 
            return socket.emit(currentRoute, {
                ...apiResponse.success(true, "Data Found !!", currentRoute,
                    {
                        availableQtyInSilo
                    })
            });
        } catch (error) {
            console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    }
}
export default getAllInventoryData;