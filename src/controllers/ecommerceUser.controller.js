// import { customMessage } from "../utility/messages.util.js";
import { apiResponse } from "../utility/response.util.js";
import Yup from "yup";
import { jsonFormator } from "../utility/toJson.util.js";
// import commonControllers from "./common.controller.js";
//import { ecommerceUserSchema } from "../yup-schemas/ecommerceUser.schema.js";
// import { sequelize } from "../config/dbConfig.js";
import { userSchema } from "../yup-schemas/userdetail.schema.js";
import { EcommerceUserModel } from "../model/ecommerceUser.model.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import { EcommerceUserView } from "../model/views/ecommerceUserView.js";
import { customMessage } from "../utility/messages.util.js";
const ecommerceUserControllers = {
  async Userdetail(data, socket, io, currentRoute) {
    try {
      console.log("data =>", data);
      // get data and validate
      const userSchema = Yup.object({
        full_name: Yup.string("Invalid name").required("Name is required"),
        email: Yup.string().nullable().email("Invalid email").default(""),
        mobile: Yup.string("Invalid Mobile Number")
          .matches(/^\d{10}$/, "Mobile number must be 10 digits long")
          .required("Mobile number is required"),
        password: Yup.string("Invalid password").required(
          "Password is required"
        ),
        address: Yup.string("Invalid address").required("address is required"),
        city: Yup.number("Invalid city").required("Please select city"),
        state: Yup.number("Invalid state").required("Please select state"),
        pincode: Yup.number()
          .typeError("Pincode must be a number")
          .transform((value, originalValue) => (originalValue ? Number(originalValue) : null))
          .required("Please enter pincode"),
        salary: Yup.number()
          .transform((value, originalValue) => {
            return originalValue == null ? 0 : value;
          })
          .default(0),
        about_me: Yup.string().default(""),
        facebook_page: Yup.string().default(""),
        website: Yup.string().default(""),
        security_money: Yup.string().default(""),
        date: Yup.date().nullable(),
      });
      const validationResult = await userSchema.validate(data, {
        abortEarly: true,
        stripUnknown: true,
      });
      console.log(validationResult);
      // find if user aleady registered
      let isExistingUser = await EcommerceUserModel.findOne({
        where: {
          mobile: validationResult.mobile,
        },
      });
      isExistingUser = jsonFormator(isExistingUser);
      console.log("user info =.........................................>>>>>", isExistingUser);
      //   if user exists
      if (isExistingUser) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "user already registered", currentRoute),
        });
      }
      // save user info in database
      let registerResult = await EcommerceUserModel.create({
        ...validationResult,
        socket_id: false,
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
  async addNewEntry(data = {}, socket, io, currentRoute) {
    try {
      const ecommerceUserSchema = Yup.object({
        full_name: Yup.string()
          .typeError("Invalid name")
          .required("Name is required"),
        email: Yup.string().nullable()
          .email("Invalid email")
          .default(""),
        mobile: Yup.string("Invalid Mobile Number")
          .matches(/^\d{10}$/, "Mobile number must be 10 digits long")
          .required("Mobile number is required"),
        password: Yup.string()
          .typeError("Invalid password")
          .required("Password is required"),
        address: Yup.string()
          .typeError("Invalid address")
          .required("address is required"),
        city: Yup.number()
          .typeError("Invalid city")
          .required("Please select city"),
        state: Yup.number()
          .typeError("Invalid state")
          .required("Please select state"),
        pincode: Yup.number()
          .typeError("Pincode must be a number")
          .transform((value, originalValue) => (originalValue ? Number(originalValue) : null))
          .required("Please enter pincode"),
        facebook_page: Yup.string().default(""),
        website: Yup.string().default(""),
        about_me: Yup.string().default(""),
      });
      const validationResult = await ecommerceUserSchema.validate(data, {
        abortEarly: true,
        stripUnknown: true,
      });
      console.log(validationResult);
      // find if user aleady registered
      let isExistingUser = await EcommerceUserModel.findOne({
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
      let registerResult = await EcommerceUserModel.create({
        ...validationResult,
        socket_id: false,
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
      ecommerceUserControllers.getAllEcommUsers(data, socket, io, "ecommerce-user:all");
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
  async getAllEcommUsers(data, socket, io, currentRoute) {
    try {
      const { id } = data;
      let EcommUserResult
      if (id) {
        EcommUserResult = await EcommerceUserView.findOne({
          where: {
            id: id,
            status: 1
          }
        })
      } else {
        EcommUserResult = await EcommerceUserView.findAll({
          where: { status: 1 },
          order: [["created_on", "DESC"]]
        });
      }
      EcommUserResult = jsonFormator(EcommUserResult);
      // console.log("products =>", EcommUserResult);
      socket.emit("ecommerce-user:all", {
        ...apiResponse.success(
          true,
          "Ecommerce User data",
          currentRoute,
          EcommUserResult
        ),
      });
    } catch (error) {
      console.error("error =>", error);
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async getById(data, socket, io, currentRoute) {
    try {
      // get  id from data
      const { Id } = data;
      console.log("id =>", Id);
      let edit = await EcommerceUserModel.findOne({
        where: { id: Id },
        // attributes: {
        //   exclude: ["created_by"],
        // },
      });
      edit = jsonFormator(edit);
      //   if edit not exists
      if (!edit) {
        return socket.emit(
          currentRoute,
          ...apiResponse.error(false, "Cannot Edit !", currentRoute)
        );
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(true, "edit", currentRoute, edit),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async updateEntry(data, socket, io, currentRoute) {
    try {
      console.table(data);
      const ecommerceUserSchema = userSchema.concat(idSchema);
      // validate user details
      const validationResult = await ecommerceUserSchema.validate(data, {
        abortEarly: true,
        stripUnknown: true,
      });
      //   update user details
      const Id = validationResult.id;
      delete validationResult.id; // remove id from user details
      console.log("validationResult", validationResult);
      let updateResult = await EcommerceUserModel.update(
        { ...validationResult, salary: parseFloat(validationResult.salary) },
        {
          where: { id: Id },
        }
      );
      // if user not updated
      if (!updateResult) {
        socket.emit(currentRoute, {
          ...apiResponse.error(
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
          "User" + customMessage.updSucc,
          currentRoute,
          validationResult
        ),
      });
      this.getAllEcommUsers(data, socket, io, "ecommerce-user:all");
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
  async deleteUser(data, socket, io, currentRoute) {
    try {
      //   find out user by id
      // let userToBeDeactivated = await EcommerceUserModel.findOne({
      //   where: {
      //     id: Id,
      //     status: true,
      //   },
      // });
      // userToBeDeactivated = jsonFormator(userToBeDeactivated);
      // //   update user status
      // console.log("userToBeDeactivated =>", userToBeDeactivated);
      // if (!userToBeDeactivated) {
      //   return socket.emit(currentRoute, {
      //     ...apiResponse.error(false, "user not found / deleted", currentRoute),
      //   });
      // }
      const deactivationResult = await EcommerceUserModel.update(
        { status: false },
        {
          where: { id: data.Id },
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
      await this.getAllEcommUsers(data, socket, io, currentRoute)
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Deleted Successfully`,
          currentRoute
        ),
      });
      //   if
      this.getAllEcommUsers(data, socket, io, "ecommerce-user:all");
    } catch (error) {
      return socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  async reactivateDeletedUser(data, socket, io, currentRoute) {
    try {
      // TODO also add  check that only admin  can  delete and rectivate user
      const { Id = false } = data;
      console.log("user data =>", Id);
      // if user i is not provide
      if (!Id) {
        return socket.emit("error", {
          ...apiResponse.success(false, customMessage.badReq, currentRoute),
        });
      }
      //   find out user by id
      let userToBeActivated = await EcommerceUserModel.findOne({
        where: {
          id: Id,
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
      const [activationResult] = await EcommerceUserModel.update(
        { status: true },
        {
          where: { id: Id },
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
      this.getAllEcommUsers(data, socket, io, "ecommerce-user:all");
      console.log("deleteResult", userToBeActivated);
    } catch (error) {
      return socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
}
export default ecommerceUserControllers;

