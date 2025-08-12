import { userControllers } from "../controllers/index.controller.js";

const userRoutes = (io, socket) => {

  // route for user registration
  socket.on("user:register", async (data) => {
    userControllers.registerUser(data, socket, io, "user:register");
  });

  // route for user login
  socket.on("user:login", async (data) => {
    userControllers.loginUser(data, socket, io, "user:login");
  });

  socket.on("user:all", async (data) => {
    userControllers.getAllUsers(data, socket, io, "user:all");
  });

  // get user by logedIn user id 
  socket.on("user:by-log-user", async (data) => {
    userControllers.getuserBysocketId(data, socket, io, "user:by-log-user");
  });

  // getting user by distribution manager or owner (12)
  socket.on("user:alldistributionmanager", async (data) => {
    userControllers.getAllUsersbyDistributionManager(data, socket, io, "user:alldistributionmanager");
  });

  //   get user by id
  socket.on("user:get-user-by-id", async (data) => {
    userControllers.getUserById(data, socket, io, "user:get-user-by-id");
  });

  socket.on("logout", async (data) => {
    userControllers.logout(data, socket, io, "logout");
  });

  socket.on("user:get-log_user", async (data) => {
    userControllers.getlogUser(data, socket, io, "user:get-log_user");
  });

  //   to update user
  socket.on("user:update", async (data) => {
    userControllers.updateUser(data, socket, io, "user:update");
  });

  // to delete / deactivate user
  socket.on("user:delete", async (data) => {
    userControllers.deleteUser(data, socket, io, "user:delete");
  }),

    //   reactivate  deleted user
    socket.on("user:reactivate", async (data) => {
      userControllers.activateDeletedUser(data, socket, io, "user:reactivate");
    }),

    socket.on("user:changePassword", async (data) => {
      userControllers.changePassword(data, socket, io, "user:changePassword");
    })
};
export default userRoutes;

// Import user routes and apply them to the socket.io server
