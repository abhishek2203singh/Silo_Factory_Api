import Sequelize from "sequelize";
import { config } from "../config/config.js";

const apiResponse = {
    success(success = true, message = "success", event = "", data = []) {
        return {
            success,
            message,
            event,
            data,
        };
    },
    error(success = false, message = "error", event = "", error = "error") {
        // let isInternalError = false;
        let resMessage = message;
        let resError = error;

        if (resError instanceof Error || resError instanceof Sequelize.BaseError) {
            resMessage =
                config.appMode == "DEV" ? resMessage : "Internal Server  error";
            resError = config.appMode == "DEV" ? resError : [];

            console.log("Error =>", error)
        }

        return {
            success,
            message: resMessage,
            event,
            error: resError,
        };
    },
};

// console.log(apiResponse.error(false, "na", "eee", new Error()));
export { apiResponse };
