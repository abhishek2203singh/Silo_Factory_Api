/* eslint-disable no-unused-vars */
/ eslint-disable no-unused-vars /
import Yup from "yup";
import { UserModel } from "../model/user.model.js";
import { UserDetailView } from "../model/views/userView.model.js";
import { apiResponse } from "../utility/response.util.js";
import { common } from "../Common/common.js";
import { tokenFormater } from "../utility/tokenFormat.util.js";
import { Op } from "sequelize";
import { UserLoginSessionModel } from "../model/userLoginSession.model.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { jwtUtil } from "../utility/jwt.util.js";
import { customMessage } from "../utility/messages.util.js";
import { registerSchema } from "../yup-schemas/registUser.schema.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import { MasterDistributionCentersModel } from "../model/masterDistributionCenter.model.js";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
const userControlers = {
    // controller to create a new user
    async registerUser(data, socket, io, currentRoute) {
        try {
            console.log("data =>", data);
            // get data and validate
            const registerSchema = Yup.object({
                full_name: Yup.string("Invalid name").required("Name is required"),
                email: Yup.string().nullable().email("Invalid email").default(""),
                mobile: Yup.string("Invalid Mobile Number")
                    .matches(/^\d{10}$/, "Mobile number must be 10 digits long")
                    .required("Mobile number is required"),
                password: Yup.string("Invalid password").required(
                    "Password is required"
                ),
                department_id: Yup.number("Invalid department").required(
                    "please select department"
                ),
                role_id: Yup.number("Invalid role").required("please select role"),
                address: Yup.string("Invalid address").required("address is required"),
                city: Yup.number("Invalid city").required("Please select city"),
                state: Yup.number("Invalid state").required("Please select state"),
                pincode: Yup.string()
                    .transform((value) => (value ? String(value) : ""))
                    .required("Please enter pincode")
                    .matches(/^\d{6}$/, "Invalid pincode"),
                profile_photo: Yup.string().default("user.jpeg"),
                salary: Yup.number()
                    .transform((value, originalValue) => {
                        return originalValue == null ? 0 : value;
                    })
                    .default(0),
                gender: Yup.string()
                    .oneOf(["male", "female", "please select gender"])
                    .required("gender is required"),
                about_me: Yup.string().default(""),
                facebook_id: Yup.string().default(""),
                google_id: Yup.string().default(""),
            });
            const validationResult = await registerSchema.validate(data, {
                abortEarly: true,
                stripUnknown: true,
            });
            console.log(validationResult);
            // find if user aleady registered
            let isExistingUser = await UserModel.findOne({
                where: {
                    mobile: validationResult.mobile,
                },
            });
            isExistingUser = jsonFormator(isExistingUser);
            console.log(
                "user info =.........................................>>>>>",
                isExistingUser
            );
            //   if user exists
            if (isExistingUser) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "user already registered", currentRoute),
                });
            }
            // save user info in database
            let registerResult = await UserModel.create({
                ...validationResult,
                dist_center_id: socket.user.distribution_center_id ?? 0,
                socket_id: false,
                created_by: socket.user.id
            });
            registerResult = jsonFormator(registerResult);
            //   if any error while createting user
            if (!registerResult?.id) {
                socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "intrenal server error,unable to perform this action",
                        currentRoute
                    ),
                });
            }
            console.log("registerResult", registerResult);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    "true",
                    "user created successfully",
                    currentRoute
                ),
            });
            this.getuserBysocketId(data, socket, io, "user:by-log-user")
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                //errorMessage=  error.inner.map(error => (error.message)).join(' ,');
                console.log("error", error);
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
            // any other errors likle db and syntex error
            console.error("Unexpected error:", error);
            return socket.emit("error", {
                ...apiResponse.error(false, "error", error.message, currentRoute),
            });
        }
    },
    // login user
    async loginUser(data, socket, io, currentRoute) {
        console.log(data)
        try {
            // login data schema
            const loginScheme = Yup.object({
                mobile: Yup.string("Invalid Mobile Number")
                    .matches(/^\d{10}$/, "Mobile number must be 10 digits long")
                    .required("Mobile number is required"),
                password: Yup.string("Invalid password").required(
                    "Password is required"
                ),
                source: Yup.number()
                    .oneOf([1, 2], "Unsupported device ") // here 1 => computer , 2=> mobile ,
                    .required("Unsupported device"),
            });
            //   validate data
            const values = await loginScheme.validate(data, { abortEarly: true });
            //   search user in database
            let user = await UserModel.findOne({
                where: {
                    mobile: values?.mobile,
                },
            });
            user = jsonFormator(user);
            //   if user not found
            if (!user) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "User does not exists ",
                        "",
                        currentRoute
                    ),
                });
            }
            //   match password
            if (user?.password != values?.password) {
                // if password is not match then send error message
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Invalid password", currentRoute),
                });
            }
            // check is logged in user is vendoer then set the vendor id
            user.vendorId = false;
            if (user?.role_id == 5) {
                user.vendorId = user?.id;
            }
            // check if user is blocked or not
            if (!user.status) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Blocked user. Please contact admin"),
                });
            }
            // add all necessary filds in user data
            user = { ...user, customer_id: 0, distribution_center_id: 0, retail_shop_id: 0, delivery_boy_id: 0 }
            // check if user is a manager or owner of distribution center
            if (user?.department_id === 6 && user?.role_id === 12) {
                const isDistributionCenterAlloted =
                    await MasterDistributionCentersModel.findOne({
                        where: {
                            manager_or_owner: user?.id,
                        },
                    });
                if (!isDistributionCenterAlloted) {
                    return socket.emit(currentRoute, {
                        ...apiResponse.error(
                            false,
                            "Distribution Center not allotted please contact to admin"
                        ),
                    });
                }
                user.distribution_center_id = jsonFormator(isDistributionCenterAlloted)?.id
            }
            let isAdmin = false
            // if current user is admin 
            if (user?.id == 1) {
                isAdmin = true
            }
            // if user is an retail shop
            if (user?.department_id == 7 && user?.role_id === 8) {
                let destributionCenterDetails = await MasterDistributionCentersModel.findOne({
                    where: {
                        manager_or_owner: user?.created_by
                    }
                })
                if (destributionCenterDetails) {
                    destributionCenterDetails = jsonFormator(destributionCenterDetails)
                    user.distribution_center_id = destributionCenterDetails?.id ?? 0;
                }
                user.retail_shop_id = user?.id;
            }
            // if user is a customer  
            if (user?.department_id === 6 && user?.role_id === 4) {
                user.customer_id = user?.id;
                // find out associated distribution center
                const distributionCenterDetails = await MasterDistributionCentersModel.findOne({
                    where: {
                        manager_or_owner: user?.created_by
                    }
                })
                if (distributionCenterDetails) {
                    user.distribution_center_id = jsonFormator(distributionCenterDetails)?.id
                }
            }
            //  if user is an delivery boy
            if (user?.department_id === 6 && user?.role_id === 7) {
                user.delivery_boy_id = user?.id;
                // find out associated distribution center
                const distributionCenterDetails = await MasterDistributionCentersModel.findOne({
                    where: {
                        manager_or_owner: user?.created_by
                    }
                })
                if (distributionCenterDetails) {
                    user.distribution_center_id = jsonFormator(distributionCenterDetails)?.id
                }
            }
            //   to remove password from user data
            delete user.password;
            user.isAdmin = isAdmin;// set isAdmin flag
            //  generate jwt token usign user credentials
            const tokenGenResult = await jwtUtil.signToken(user);
            // if any error while generating token
            if (!tokenGenResult.success) {
                socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "unable to perform this action ",
                        currentRoute
                    ),
                });
            }
            // save user session in database
            var sessiondata = await common.saveUserSession(
                user?.id,
                data?.source,
                tokenGenResult?.token,
                data?.firebasetoken,
                socket?.id,
                data?.imei
            );
            //   if any error while serving session
            if (!sessiondata.success || !tokenGenResult.token) {
                socket.emit("error", {
                    ...apiResponse.error(false, "Internal Server error "),
                });
            }
            // encrypt token
            const formatedToken = tokenFormater.decode(tokenGenResult.token);
            // get current user data
            let newUserData = await UserModel.findOne({
                where: {
                    mobile: values?.mobile,
                },
            });
            newUserData = jsonFormator(newUserData);
            // fetch department details of the curent user
            const departmentDetails = jsonFormator(await MasterDepartmentModel.findByPk(newUserData.department_id));
            console.log("department details =>", departmentDetails)
            const resposeData = {
                accessToken: formatedToken,
                id: newUserData?.id,
                mobile: newUserData?.mobile,
                roleId: newUserData?.role_id,
                departmentId: newUserData?.department_id,
                socketId: newUserData?.socket_id,
                status: newUserData?.Status,
                onlineStatus: newUserData?.user_status,
                isOtherDpt: departmentDetails?.table_name == "Other_Department",
                code: 200,
            };
            socket.broadcast.emit("useronlinestatus", {
                ...apiResponse.success(true, "new user logged in ", "loginapi", {
                    id: newUserData?.id,
                    onlineStatus: 1,
                    code: 200,
                }),
            });
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "Logged in successfully!",
                    currentRoute,
                    resposeData
                ),
            });
            //   genetate jwt token
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                //errorMessage=  error.inner.map(error => (error.message)).join(' ,');
                return socket.emit("error", {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
            console.error("ERROR => ", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    // update user
    async updateUser(data, socket, io, currentRoute) {
        try {
            console.table(data);
            const userDetailsSchema = registerSchema.concat(idSchema);
            // validate user details
            const validationResult = await userDetailsSchema.validate(data, {
                abortEarly: true,
                stripUnknown: true,
            });
            //   update user details
            const userId = validationResult.id;
            delete validationResult.id; // remove id from user details
            console.log("validationResult", validationResult);
            const {
                about_me,
                gender,
                salary,
                profile_photo,
                pincode,
                state,
                city,
                address,
                facebook_id,
                google_id,
                role_id,
                department_id,
                password,
                mobile,
                full_name,
            } = validationResult;
            let [updateResult] = await UserModel.update(
                { ...validationResult, salary: parseFloat(validationResult.salary) },
                {
                    where: { id: userId },
                }
            );
            // if user not updated
            if (updateResult == 0) {
                return socket.emit(currentRoute, {
                    ...apiResponse.success(
                        false,
                        "User not updated",
                        currentRoute,
                        validationResult
                    ),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    "User updated successfully",
                    currentRoute,
                    validationResult
                ),
            });
            this.getAllUsers(data, socket, io, "user:all");
            this.getuserBysocketId(data, socket, io, "user:by-log-user")
        } catch (error) {
            console.error("ERROR  while updating => ", error);
            if (error instanceof Yup.ValidationError) {
                //errorMessage=  error.inner.map(error => (error.message)).join(' ,');
                console.error("validation error =>", error.message);
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
            return socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    //   function to get infomation of logged in user
    async getlogUser(data, socket, io, currentRoute) {
        try {
            // get loged user id from data
            let user = await UserDetailView.findOne({
                attributes: { exclude: ["password"] },
                where: { id: socket.user.id },
            });
            user = jsonFormator(user);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    "true",
                    "user Details successfully",
                    currentRoute,
                    user
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    //   delete user / deactivate
    async deleteUser(data, socket, io, currentRoute) {
        try {
            const { userId = false } = data;
            console.log("user data =>", userId);
            // if user i is not provide
            if (!userId) {
                return socket.emit("error", {
                    ...apiResponse.success(false, customMessage.badReq, currentRoute),
                });
            }
            //   find out user by id
            let userToBeDeactivated = await UserModel.findOne({
                where: {
                    id: userId,
                    status: true,
                },
            });
            userToBeDeactivated = jsonFormator(userToBeDeactivated);
            //   update user status
            console.log("userToBeDeactivated =>", userToBeDeactivated);
            if (!userToBeDeactivated) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "user not found / deleted", currentRoute),
                });
            }
            const deactivationResult = await UserModel.update(
                { status: false },
                {
                    where: { id: userId },
                }
            );
            console.log("updated =>", deactivationResult);
            if (deactivationResult == 0) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "unable to perform this action ",
                        currentRoute
                    ),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    `'${userToBeDeactivated?.full_name} ' deleted successfully`,
                    currentRoute
                ),
            });
            //   if
            this.getAllUsers(data, socket, io, "user:all");
            this.getuserBysocketId(data, socket, io, "user:by-log-user");
        } catch (error) {
            return socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    // activate deleted user
    async reactivateDeletedUser(data, socket, io, currentRoute) {
        try {
            // TODO also add  check that only admin  can  delete and rectivate user
            const { userId = false } = data;
            console.log("user data =>", userId);
            // if user i is not provide
            if (!userId) {
                return socket.emit("error", {
                    ...apiResponse.success(false, customMessage.badReq, currentRoute),
                });
            }
            //   find out user by id
            let userToBeActivated = await UserModel.findOne({
                where: {
                    id: userId,
                    status: false,
                },
            });
            userToBeActivated = jsonFormator(userToBeActivated);
            //   update user status
            console.log("userToBeActivated =>", userToBeActivated);
            if (!userToBeActivated) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "user not found or Not deleted ",
                        currentRoute
                    ),
                });
            }
            const [activationResult] = await UserModel.update(
                { status: true },
                {
                    where: { id: userId },
                }
            );
            if (activationResult == 0) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        "unable to perform this action ",
                        currentRoute
                    ),
                });
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    true,
                    `'${userToBeActivated?.full_name} ' reactivated successfully`,
                    currentRoute
                ),
            });
            this.getAllUsers(data, socket, io, "user:all");
            console.log("deleteResult", userToBeActivated);
        } catch (error) {
            return socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    // get user by id
    async getUserById(data, socket, io, currentRoute) {
        console.log("user id =>", data);
        try {
            // get user id from data
            const { userId } = data;
            console.log("user id =>", userId);
            let user = await UserDetailView.findOne({
                where: { id: userId },
                attributes: {
                    exclude: ["created_by"],
                },
            });
            user = jsonFormator(user);
            //   if user not exists
            if (!user) {
                return socket.emit(
                    currentRoute,
                    ...apiResponse.error(false, "user not found !", currentRoute)
                );
            }
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "user", currentRoute, user),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async logout(data, socket, io, currentRoute) {
        const { user } = socket; // extract user id  fro session
        try {
            const logoutResult = await UserModel.update(
                { online_status: 0 },
                { where: { id: user.id } }
            );
            const loginSessionResult = await UserLoginSessionModel.create({
                user_id: user.id,
                log_off_time: new Date().toLocaleDateString("en-IN"),
                jwt_token: "xyz",
                socket_token: socket.id,
                login_device_type_id: 1,
            });
            socket.broadcast.emit("useronlinestatus", {
                ...apiResponse.success(true, "Logged in successfully!", "logout", {
                    id: user.id,
                    onlineStatus: 0,
                    code: 200,
                }),
            });
            //   if any error while logout
            if (!loginSessionResult) {
                return socket.emit("error", {
                    ...apiResponse.error(
                        false,
                        "internal server error ",
                        "unalbe to perform this action ",
                        currentRoute
                    ),
                });
            }
            // logged out success fully
            socket.emit("logout", {
                ...apiResponse.success(true, "logout successfully", currentRoute),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute),
            });
        }
    },
    // get all user in database
    async getAllUsers(data, socket, io, currentRoute) {
        let filters = {
            role_id: {
                [Op.ne]: 1
            },
            id: {
                [Op.ne]: socket.user.id
            },
            status: 1,
        }
        if (socket.user.id !== 1) {
            filters = {
                ...filters, created_by: socket.user.id, role_id: {
                    [Op.notIn]: [8, 10]// to hide retail shops and retail customers
                }
            };
        }
        console.log("new filters =>", filters)
        try {
            let userResult = await UserDetailView.findAll({
                attributes: [
                    "id",
                    "full_name",
                    "mobile",
                    "email",
                    "role_id",
                    "pincode",
                    "department_name",
                    "city_name",
                    "state_name",
                    "address",
                    "facebook_id",
                    "google_id",
                    "joining_date",
                    "role_name",
                    "status",
                    "created_on", // Assuming your view has this field. If not, use an appropriate timestamp field.
                ],
                // where:
                //     filters
                // ,
                order: [[["created_on", "DESC"]]],
            });
            userResult = jsonFormator(userResult);
            socket.emit("user:all", {
                ...apiResponse.success(
                    true,
                    "All users fetched successfully",
                    currentRoute,
                    userResult
                ),
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            socket.emit("error", {
                ...apiResponse.error(
                    false,
                    "Error fetching users",
                    currentRoute,
                    error
                ),
            });
        }
    },
    async getuserBysocketId(data, socket, io, currentRoute) {
        try {
            // get loged user id from data
            let user = await UserDetailView.findAll({
                order: [["created_on", "DESC"]],
                where: { created_by: socket.user.id, status: 1 },
            });
            user = jsonFormator(user);
            socket.emit(currentRoute, {
                ...apiResponse.success(
                    "true",
                    "user Details successfully",
                    currentRoute,
                    user
                ),
            });
        } catch (error) {
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async getAllUsersbyDistributionManager(data, socket, io, currentRoute) {
        let filters = {
            role_id: 12, // Include only users with role_id 12
            status: 1, // Active users only
        };
        console.log("new filters =>", filters);
        try {
            let userResult = await UserDetailView.findAll({
                attributes: [
                    "id",
                    "full_name",
                    "mobile",
                    "email",
                    "role_id",
                    "pincode",
                    "department_name",
                    "city_name",
                    "state_name",
                    "address",
                    "facebook_id",
                    "google_id",
                    "joining_date",
                    "role_name",
                    "status",
                    "created_on",
                ],
                where: filters,
                order: [["created_on", "DESC"]],
            });
            userResult = jsonFormator(userResult);
            socket.emit("user:alldistributionmanager", {
                ...apiResponse.success(
                    true,
                    "All users fetched successfully",
                    currentRoute,
                    userResult
                ),
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            socket.emit("error", {
                ...apiResponse.error(
                    false,
                    "Error fetching users",
                    currentRoute,
                    error
                ),
            });
        }
    },



    async changePassword(data, socket, io, currentRoute) {
        try {
            console.log("Change password request for user:", socket.user.id);

            const changePasswordSchema = Yup.object({
                currentPassword: Yup.string("Invalid current password").required("Current password is required"),
                newPassword: Yup.string("Invalid new password")
                    .min(6, "New password must be at least 6 characters long")
                    .required("New password is required"),
                confirmPassword: Yup.string("Invalid confirm password")
                    .test("password-matched", "Passwords do not match", function (value) {
                        return this.parent.newPassword === value;
                    })
                    .required("Confirm password is required")
            });

            const validationResult = await changePasswordSchema.validate(data, {
                abortEarly: false, // Changed to false to get all validation errors
                stripUnknown: true,
            });

            // Find user
            let currentUser = await UserModel.findOne({
                where: {
                    id: socket.user.id,
                    status: true
                }
            });

            currentUser = jsonFormator(currentUser);

            // Check if user exists
            if (!currentUser) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "User not found", currentRoute),
                });
            }

            // Verify current password (plain text comparison)
            if (currentUser.password !== validationResult.currentPassword) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Current password is incorrect", currentRoute),
                });
            }

            // Check if new password is different from current password
            if (validationResult.currentPassword === validationResult.newPassword) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "New password must be different from current password", currentRoute),
                });
            }

            // Update password in database
            const [updateResult] = await UserModel.update(
                {
                    password: validationResult.newPassword,
                    passwordChangedAt: new Date() // Optional: track when password was changed
                },
                {
                    where: { id: socket.user.id }
                }
            );

            // Check if password was updated successfully
            if (updateResult === 0) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Failed to update password", currentRoute),
                });
            }

            // Log password change activity (without sensitive data)
            console.log(`Password changed successfully for user ID: ${socket.user.id} at ${new Date().toISOString()}`);

            // Send success response
            return socket.emit("user:changePassword", {
                ...apiResponse.success(
                    true,
                    "Password changed successfully",
                    currentRoute
                ),
            });

        } catch (error) {
            console.error("Error changing password:", error);

            if (error instanceof Yup.ValidationError) {
                // Return all validation errors
                const validationErrors = error.inner.map(err => ({
                    field: err.path,
                    message: err.message
                }));

                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, "Validation failed", currentRoute, {
                        validationErrors
                    }),
                });
            }

            return socket.emit(currentRoute, {
                ...apiResponse.error(false, "Internal server error", currentRoute),
            });
        }
    }
};
export default userControlers;

