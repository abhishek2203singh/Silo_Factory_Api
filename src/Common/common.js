// import { sequelize } from "../config/dbConfig.js";
import { UserModel } from "../model/user.model.js";
import { UserLoginSessionModel } from "../model/userLoginSession.model.js";

const common = {
  // to save user session in database
  async saveUserSession(
    userId = false,
    deviceType = false,
    jwtToken = false,
    fireBaseToken = false,
    socketId = false
  ) {
    try {
      // save user session
      const loginSessionResult = await UserLoginSessionModel.create({
        user_id: userId,
        log_time: Date.now(),
        jwt_token: jwtToken,
        socket_token: socketId,
        login_device_type_id: deviceType,
      }).then((result) => {
        if (!result) return result;
        return result.toJSON();
      });

      // console.log("seve result  =>", loginSessionResult);
      //   if any error while seving session

      //   console.log("seve result =>", loginSessionResult);

      if (!loginSessionResult) {
        throw new Error("something went wrong");
      }

      //   if firebase tokent is available
      if (fireBaseToken) {
        const upadteUserResult = await UserModel.update(
          {
            FirebaseToken: fireBaseToken,
            SocketId: socketId,
          },
          {
            where: { id: userId },
          }
        );

        // console.log("update user result =>", upadteUserResult);
      }

      const user = await UserModel.update(
        {
          socket_id: socketId,
          firebase_token: fireBaseToken,
          online_status: 1,
        },
        { where: { id: userId } }
      );
      if (!user) {
        return {
          success: false,
          message: "unable to login !",
        };
      }

      //   send login success message
      return {
        success: true,
        message: "login successful",
      };
    } catch (error) {
      // console.error("error =>", error);
      return {
        success: false,
        message: error.message,
      };
    }
    // });
  },
};

export { common };
