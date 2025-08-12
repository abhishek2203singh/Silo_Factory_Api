import chalk from "../../node_modules/chalk/source/index.js";
import { apiResponse } from "../utility/response.util.js";
import { verifyToken } from "../utility/verifyToken.util.js";

const auth = async (socket, event, next) => {
    try {
        // not apply authentication in case of unknown user
        if (event == "user:login" || (event == "customer:register" && !socket?.handshake?.headers?.token) || event == undefined) {
            //console.log("Handshake =>", socket?.handshake?.headers?.token)
            return next();
        }

        let token = false;
        token = socket?.handshake?.headers?.token ?? false;
        // console.log("token =>", token);
        if (!token || token === "undefined" || token == "") {
            return socket.emit("error", {
                ...apiResponse.error(false, "login please", event, 402),
            });
        }

        // Verify the token
        const tokenResult = await verifyToken(token); // Assuming verifyToken returns a promise

        if (!tokenResult.success) {
           
            console.log("\n ", chalk.bgRedBright(" token verification failed => "), tokenResult, "\n");
           
            return socket.emit("error", {
                ...apiResponse.error(false, "login please", event, 402),
            });
        }

        // Attach user information to the socket
        socket.user = tokenResult.user;
        next();
    } catch (error) {
        console.error("error =>", error);
        return {
            success: false,
            message: "internal server error",
        };
    }
};

export { auth };
