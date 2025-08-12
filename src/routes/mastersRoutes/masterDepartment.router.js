import {
  departmentControllers,
  masterDepartmentControllers,
} from "../../controllers/index.controller.js";

function masterDepartmentRouters(io, socket) {
  //   create new department

  socket.on("ms-department:create", (data) => {
    masterDepartmentControllers.createDepartment(
      data,
      socket,
      io,
      "ms-department:create"
    );
  });

  //   update department
  socket.on("ms-department:update", (data) => {
    masterDepartmentControllers.updateDepartment(
      data,
      socket,
      io,
      "ms-department:update"
    );
  });

  //   delete department
  socket.on("ms-department:delete", (data) => {
    masterDepartmentControllers.deleteDepartment(
      data,
      socket,
      io,
      "ms-department:delete"
    );
  });

  //   get department by id
  socket.on("ms-department:by-id", (data) => {
    masterDepartmentControllers.getDepartmentById(
      data,
      socket,
      io,
      "ms-department:by-id"
    );

    // to reaload all departments
    departmentControllers.getAllDepartment(data, socket, io, "department:all");
  });
}

export default masterDepartmentRouters;
