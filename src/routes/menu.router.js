/* eslint-disable no-unused-vars */
import { menuControllers } from "../controllers/index.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { apiResponse } from "../utility/response.util.js";

function menuRoutes(io, socket) {
    // route for menus items include menu, sub menu, sub sub menu

    socket.on("menus:all", async (data) => {
        menuControllers.getFullMenus(data, socket, io, "menus:all");
    });

    socket.on("menus:departmentid", async (data) => {
        menuControllers.getMenusDepartmentid(data, socket, io, "menus:departmentid");
    });

    socket.on("menus:mapingListing", async (data) => {
        menuControllers.mapingListing(data, socket, io, "menus:mapingListing");
    });

    //   get menus acccording to logedin user ,include menu, sub menu, sub sub menu
    socket.on("menus:by-user", async (data) => {
        menuControllers.getMenusByUser(data, socket, io, "menus:by-user");
    });

    //   *******************************************  MENU ***************************************************

    // create new menu
    //update menu
    socket.on("menu:create", async (data) => {
        menuControllers.createMenu(data, socket, io, "menu:create");
    });

    //   update menu
    socket.on("menu:update", async (data) => {
        menuControllers.updateMenu(data, socket, io, "menu:update");
    });

    //   delete menu
    socket.on("menu:delete", async (data) => {
        menuControllers.deleteMenu(data, socket, io, "menu:delete");
    });

    //   get all menus form menu table ( active)
    socket.on("menu:all", async (data) => {
        menuControllers.getAllMenus(data, socket, io, "menu:all");
    });

    //   get all sub menus by department id
    socket.on("menu:all-by-department", async (data) => {
        menuControllers.getMenusByDepartmentId(data, socket, io, "menu:all-by-department");
    });

    //   get  menu by id
    socket.on("menu:by-id", async (data) => {
        menuControllers.getMenuById(data, socket, io, "menu:by-id");
    });

    //   ********************************************************   sub menu ********************************************

    //   create sub-munu
    socket.on("sub-menu:create", async (data) => {
        menuControllers.createSubMenu(data, socket, io, "sub-menu:create");
    });

    //   update sub menu
    socket.on("sub-menu:update", async (data) => {
        menuControllers.createSubMenu(data, socket, io, "sub-menu:update");
    });

    //   delete sub menu
    socket.on("sub-menu:delete", async (data) => {
        menuControllers.deleteSubMenu(data, socket, io, "sub-menu:delete");
    });

    //   get sub-menu by id
    socket.on("sub-menu:by-id", async (data) => {
        menuControllers.getSubMenuById(data, socket, io, "sub-menu:by-id");
    });

    //   get all sub-menus which are associated with selected menu 
    socket.on("sub-menu:all-by-menu-id", async (data) => {
        menuControllers.getSubMenuByMenuId(data, socket, io, "sub-menu:all-by-menu-id");
    });


    //   get all sub-menus ( active)
    socket.on("sub-menu:all", async (data) => {
        menuControllers.getAllSubMenus(data, socket, io, "sub-menu:all");
    });

    // get all sub-menu by department id
    socket.on("sub-menu:all-by-department", async (data) => {
        menuControllers.getSubMenusByDepartmentId(data, socket, io, "sub-menu:all-by-department");
    });

    //   ************************************************************* sub sub menu **********************************************

    //   create sub sub menu
    socket.on("sub-sub-menu:create", async (data) => {
        menuControllers.createSubSubMenu(data, socket, io, "sub-sub-menu:create");
    });

    //   update sub-sub menu
    socket.on("sub-sub-menu:update", async (data) => {
        menuControllers.updateSubSubMenu(data, socket, io, "sub-sub-menu:update");
    });

    //   delete sub sub menu
    socket.on("sub-sub-menu:delete", async (data) => {
        menuControllers.deleteSubSubMenu(data, socket, io, "sub-sub-menu:delete");
    });

    //   get  sub-sub menu by id ( active)
    socket.on("sub-sub-menu:by-id", async (data) => {
        menuControllers.getSubSubMenuById(data, socket, io, "sub-sub-menu:by-id");
    });

    //   get all   sub-sub-menus  ( active)
    socket.on("sub-sub-menu:all", async (data) => {
        menuControllers.getAllSubSubMenus(data, socket, io, "sub-sub-menu:all");
    });

    // get all sub-menu by department id
    socket.on("sub-sub-menu:all-by-department", async (data) => {
        menuControllers.getSubSubMenusByDepartmentId(data, socket, io, "sub-sub-menu:all-by-department");
    });
}

export default menuRoutes;
