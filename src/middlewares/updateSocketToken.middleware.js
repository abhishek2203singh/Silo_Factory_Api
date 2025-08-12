import { UserModel } from "../model/user.model.js";
import { UserDetailView } from "../model/views/userView.model.js";
import { apiResponse } from "../utility/response.util.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { verifyToken } from "../utility/verifyToken.util.js";
// import { auth } from "./auth.middleware.js";

// to update socket id

const updateSocketToken = async (authToken, onlineStatus, socket) => {
    try {
        const verification = await verifyToken(authToken);
        //  if user is not authenticated then return to assume that this is user firs time login
        if (!verification.success) {
            console.log(verification);
            return;
        }

        let result = await UserModel.findOne({
            where: {
                id: verification.user.id,
            },
        });

        const oldToken = result.socket_id;
        result.socket_id = socket.id;
        result.online_status = onlineStatus;
        let created = await result.save({});
        created = jsonFormator(created);
        socket.userName = created.full_name;

        // display user statu globally
        socket.broadcast.emit("useronlinestatus", {
            ...apiResponse.success(true, "new user logged in ", "loginapi", {
                id: created.id,
                onlineStatus: created.online_status,
                code: 200,
            }),
        });
        // get user full details from user view
        let userDetails = await UserDetailView.findOne({
            where: {
                id: verification.user.id
            }
        })
        userDetails = jsonFormator(userDetails);
        // console.log("user details =>", userDetails)

        console.log(onlineStatus ? "connected =>" : "disconnected=>", {
            updated: true,
            old_token: oldToken,
            new_token: created.socket_id,
            onlineStatus: created.online_status,
            userName: created.full_name,
            mobileNo: userDetails.mobile,
            userId: created.id,
            depatmentNameAndId: `${userDetails.department_name}  [ ${userDetails.department_id} ]`,
            roleAndId: `${userDetails.role_name}  [ ${userDetails.role_id} ]`
        });

    } catch (error) {
        console.error("error while updating socket token =>", error);
        socket.emit("error", {
            ...apiResponse.error(false, error.message, "Connection", error),
        });
    }
};

export { updateSocketToken };
