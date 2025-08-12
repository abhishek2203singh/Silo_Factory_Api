import { departmentControllers } from "../controllers/index.controller.js";

const departmentRouters = (io, socket) => {
  // route for user registration
  socket.on("department:all", async (data) => {
    departmentControllers.getAllDepartment(data, socket, io, "department:all");
  });

  socket.on("department:head", async (data) => {
    departmentControllers.getAllDepartmentHead(
      data,
      socket,
      io,
      "department:head"
    );
  });
};
export default departmentRouters;
