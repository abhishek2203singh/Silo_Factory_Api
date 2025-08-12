/* eslint-disable no-unused-vars */
import Yup from "yup";
import { MenuModel } from "../model/menu.model.js";
import { MenuMappingModel } from "../model/menuMapping.model.js";
import { SubMenuModel } from "../model/subMenu.model.js";
import { SubSubMenuModel } from "../model/subSubMenu.model.js";
import { apiResponse } from "../utility/response.util.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { SubMapingModel } from "../model/subMapping.model.js";
import { SubSubMappingModel } from "../model/subSubMapping.model.js";
import { sequelize } from "../config/dbConfig.js";
import { MenuUserMenuMappingView } from "../model/views/menuMappingView.model.js";
import { where } from "sequelize";
import { SubMenuUserSubMenuMappingView } from "../model/views/subMenuMappingView.model.js";
import { customMessage } from "../utility/messages.util.js";
import { changeDetector } from "../utility/changeDetector.util.js";
const menuControllers = {
  // get all menus include menu, sub menu, sub sub menu
  async getFullMenus(data, socket, io, currentRoute) {
    try {
      let menus = await MenuModel.findAll({
        attributes: [
          "id",
          "menu_name",
          "icon",
          "serial_no",
          "has_sub_menu",
          "url_route",
          "status",
        ],
      });
      menus = jsonFormator(menus);

      let subMenus = await SubMenuModel.findAll({
        attributes: [
          "id",
          "menu_name",
          "icon",
          "serial_no",
          "has_sub_menu",
          "url_route",
          "status",
        ],
      });
      subMenus = jsonFormator(subMenus);

      let subSubMenu = await SubSubMenuModel.findAll({
        attributes: [
          "id",
          "menu_name",
          "icon",
          "serial_no",
          "url_route",
          "status",
        ],
      });
      subSubMenu = jsonFormator(subSubMenu);

      socket.emit(currentRoute, {
        ...apiResponse.success(true, "menus", currentRoute, {
          parent: menus,
          child: subMenus,
          grandChild: subSubMenu,
        }),
      });
      //   return socket.emit("menu:all", { menus });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  // get all menus which are asssigned to a perticular user
  async getMenusByUser(data, socket, io, currentRoute) {
    const { user } = socket;
    try {
      // main menus
      let parentMenus = await MenuUserMenuMappingView.findAll({
        attributes: {
          exclude: ["created_by", "created_on", "updated_by", "updated_on"],
        },
        where: {
          user_id: user.id,
          status: true,
        },
      });

      parentMenus = jsonFormator(parentMenus);

      //   child menus
      //   let childMenus = await SubMapingModel.findAll(
      //     {
      //       //   attributes: [
      //       //     "id",
      //       //     "menu_name",
      //       //     "icon",
      //       //     "serial_no",
      //       //     "has_sub_menu",
      //       //     "url_route",
      //       //     "status",
      //       //   ],
      //       //   attributes: [""],
      //       include: {
      //         model: SubMenuModel,
      //         attributes: ["menu_name", "has_sub_menu"],
      //         where:{
      //             status:1,
      //         },
      //         include: {
      //           model: SubSubMenuModel,

      //         }
      //       },
      //     },
      //     { where: { user_id: user.id } }
      //   );

      let childMenus = await SubMenuUserSubMenuMappingView.findAll({
        attributes: {
          exclude: ["created_by", "created_on", "updated_by", "updated_on"],
        },
        where: {
          user_id: user.id,
          status: true,
        },
      });

      childMenus = jsonFormator(childMenus);

      let grandChildMenus = await SubMenuUserSubMenuMappingView.findAll({
        attributes: {
          exclude: ["created_by", "created_on", "updated_by", "updated_on"],
        },
        where: {
          user_id: user.id,
          status: true,
        },
      });

      grandChildMenus = jsonFormator(grandChildMenus);
      // grand child menus

      socket.emit(currentRoute, {
        ...apiResponse.success(true, "menus", currentRoute, {
          parent: parentMenus,
          child: childMenus,
          grandChild: grandChildMenus,
        }),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  // *************************************************************  Menu CRUD operation  *********************

  // get all menus
  async getAllMenus(data, socket, io, currentRoute) {
    try {
      let menusResult = await MenuModel.findAll({
        attributes: {
          exclude: ["created_by", "created_on", "updated_by", "updated_on"],
          where: {
            status: true,
          },
        },
      });

      menusResult = jsonFormator(menusResult);

      socket.emit(currentRoute, {
        ...apiResponse.success(true, "menus", currentRoute, menusResult),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },

  //   get a single menu by menu id
  async getMenuById(data, socket, io, currentRoute) {
    try {
      const { menuId = false } = data;
      if (!menuId || menuId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      //   fetch sub-menu by id
      let menuResult = await MenuModel.findOne({
        where: {
          id: menuId,
          status: true,
        },
      });

      if (!menuResult) {
        return socket.emit("error", {
          ...apiResponse.error(
            false,
            "Submenu not found",
            currentRoute,
            "Submenu not found"
          ),
        });
      }

      menuResult = jsonFormator(menuResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Menu fetched successfully",
          currentRoute,
          menuResult
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },

  //   create new menu
  async createMenu(data, socket, io, currentRoute) {
    try {
      const menuSchema = Yup.object({
        name: Yup.string("invalid  menus name").required(
          " menu name is required"
        ),
        icon: Yup.string("invalid icon").required("icon is required"),
        route: Yup.string("route / path is required ").required(
          "please enter a route / path "
        ),
        hasSubMunus: Yup.boolean("all fields are required").default(false),
        status: Yup.boolean("please select a status").default(false),
      });

      const validationResult = await menuSchema.validate(data, {
        abortEarly: true,
        stripUnknown: true,
      });
      const { name, status, icon, hasSubMunus, route } = validationResult;

      const isMenuExists = await MenuModel.findOne({
        where: {
          menu_name: name,
          icon: icon,
          has_sub_menu: hasSubMunus,
          url_route: route,
        },
      });

      if (isMenuExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "Menu already exists", currentRoute, ""),
        });
      }

      const serialNo = await MenuModel.max("serial_no");

      let newMenuResult = await MenuModel.create({
        menu_name: name,
        icon: icon,
        has_sub_menu: hasSubMunus,
        url_route: route,
        serial_no: serialNo + 1,
        status: status,
        created_by: socket.user.id,
      });

      newMenuResult = jsonFormator(newMenuResult);
      // if any error while creating menu
      if (!newMenuResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Error while creating menu",
            currentRoute,
            ""
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Menu '${name} ' created successfully !`,
          currentRoute,
          newMenuResult
        ),
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, error.message, currentRoute, error),
        });
      }

      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },

  //   update menu
  async updateMenu(data, socket, io, currentRoute) {
    try {
      const menuSchema = Yup.object({
        menuId: Yup.number()
          .typeError(customMessage.badReq)
          .min(1, customMessage.badReq)
          .required(customMessage.badReq),
        name: Yup.string("invalid  menus name").required(
          " menu name is required"
        ),
        icon: Yup.string("invalid icon").required("icon is required"),
        route: Yup.string("route / path is required ").required(
          "please enter a route / path "
        ),
        hasSubMunus: Yup.boolean("all fields are required").default(false),
        status: Yup.boolean("please select a status").default(false),
        priorityLevel: Yup.string()
          .oneOf(
            ["permanent", "temporary"],
            "Please select menu's priority level like , permanent or temporary"
          )
          .required("priority level is required !"),
      });

      const { menuId, name, icon, route, hasSubMunus, status, priorityLevel } =
        await menuSchema.validate(data);

      // find menu if exists
      let isExists = await MenuModel.findOne({
        attributes: {
          exclude: [
            "created_by",
            "created_on",
            "updated_by",
            "updated_on",
            "serial_no",
          ],
        },
        where: {
          id: menuId,
        },
      });
      if (!isExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Menu not found",
            currentRoute,
            "Menu not found"
          ),
        });
      }

      isExists = jsonFormator(isExists);

      const changes = {
        id: menuId,
        menu_name: name,
        icon: icon,
        is_deletable: priorityLevel === "permanent" ? 0 : 1,
        has_sub_menu: hasSubMunus,
        url_route: route,
        status: Number(status),
      };

      const hasChanges = changeDetector(isExists, changes);

      if (!hasChanges) {
        return socket.emit(currentRoute, {
          ...apiResponse.success(
            true,
            "No changes detected, update skipped",
            currentRoute
          ),
        });
      }

      // if menu is not deleteble
      if (!isExists.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `The menu ' ${isExists.menu_name} ' can't be modified`
          ),
        });
      }

      const [updateReult] = await MenuModel.update(
        {
          menu_name: name,
          has_sub_menu: hasSubMunus,
          icon: icon,
          url_route: route,
          status: status,
          updated_by: socket.user.id,
        },
        {
          where: { id: menuId },
        }
      );
      //  console.log("updateReult =>", updateReult);

      if (!updateReult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Error while updating menu",
            currentRoute,
            ""
          ),
        });
      }

      socket.emit(currentRoute, {
        ...apiResponse.success(true, "Menu updated successfully", currentRoute),
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, error.message, currentRoute, error),
        });
      }
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },

  // delete menu
  async deleteMenu(data, socket, io, currentRoute) {
    try {
      const { menuId = false } = data;
      if (!menuId || menuId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      let isExists = await MenuModel.findOne({
        where: {
          id: menuId,
        },
      });
      isExists = jsonFormator(isExists);
      // if menu is not deleteble
      if (!isExists.is_deletable) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            `The menu ' ${isExists.menu_name} ' can't be modified`
          ),
        });
      }

      const [deleteResult] = await MenuModel.update(
        {
          status: false,
          updated_by: socket.user.id,
        },
        {
          where: { id: menuId },
        }
      );
      if (!deleteResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "Error while deleting menu"),
        });
      }
      // TODO:  delete menu logic here ................
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },

  // *************************************************************  Sub Menu CRUD operation  *********************

  //   get all sub menus
  async getAllSubMenus(data, socket, io, currentRoute) {
    try {
      let allSubMenusResult = await SubMenuModel.findAll({
        where: {
          status: true,
        },
        attributes: {
          exclude: ["created_by", "created_on", "updated_by", "updated_on"],
        },
      });
      allSubMenusResult = jsonFormator(allSubMenusResult);

      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "All sub menus fetched successfully",
          currentRoute,
          allSubMenusResult
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
  //   create new sub menu
  async createSubMenu(data, socket, io, currentRoute) {
    try {
      const subMenuSchema = Yup.object({
        name: Yup.string("invalid  sub-menus name").required(
          " sub-menu name is required"
        ),
        parentMenu: Yup.number("invalid menu  selected ").required(
          "please select a menu "
        ),
        icon: Yup.string("invalid icon").required("icon is required"),
        route: Yup.string("route / path is required ").required(
          "please enter a route / path"
        ),
        hasSubMunus: Yup.boolean("all fields are required").default(false),
        status: Yup.boolean("please select a status").default(false),
      });

      const validationResult = await subMenuSchema.validate(data, {
        abortEarly: true,
        stripUnknown: true,
      });

      const { name, icon, parentMenu, hasSubMunus, route, status } =
        validationResult;
      // check wether the menu with credentials is already exists

      const isSubMenuExists = await SubMenuModel.findOne({
        where: {
          menu_name: name,
          icon: icon,
          has_sub_menu: hasSubMunus,
          url_route: route,
          menu_id: parentMenu,
        },
      });

      if (isSubMenuExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Sub Menu" + customMessage.exists,
            currentRoute,
            ""
          ),
        });
      }

      const serialNo = SubMenuModel.max("serial_no"); // to get max serial number from  table

      let newSubMenuResult = await SubMenuModel.create({
        menu_name: name,
        icon: icon,
        serial_no: serialNo + 1,
        has_sub_menu: hasSubMunus,
        url_route: route,
        menu_id: parentMenu,
        status: status,
        created_by: socket.user.id,
      });

      newSubMenuResult = jsonFormator(newSubMenuResult);
      // if any error while creating menu
      if (!newSubMenuResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            customMessage.creaErr + " sub menu",
            currentRoute,
            ""
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          ` Sub menu '${name} ` + customMessage.creaSucc,
          currentRoute
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },

  async updateSubMenu(data, socket, io, currentRoute) {
    try {
      const subMenuSchema = Yup.object({
        subMenuId: Yup.number()
          .typeError(customMessage.badReq)
          .min(1, customMessage.badReq)
          .required(customMessage.badReq),
        name: Yup.string("invalid  menus name").required(
          " menu name is required"
        ),
        icon: Yup.string("invalid icon").required("icon is required"),
        route: Yup.string("route / path is required ").required(
          "please enter a route / path "
        ),
        hasSubMunus: Yup.boolean("all fields are required").default(false),
        status: Yup.boolean("please select a status").default(false),
        priorityLevel: Yup.string()
          .oneOf(
            ["permanent", "temporary"],
            "Please select menu's priority level like , permanent or temporary"
          )
          .required("priority level is required !"),
      });

      const {
        subMenuId,
        name,
        icon,
        parentMenu,
        hasSubMunus,
        priorityLevel,
        route,
        status,
      } = subMenuSchema;

      // check is sub menu exists

      let isSubMenuExists = await SubMenuModel.findOne({
        attributes: {
          exclude: ["created_by", "created_on", "updated_by", "updated_on"],
        },
      });

      if (!isSubMenuExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, "Sub Menu not found", currentRoute),
        });
      }

      const changes = {
        menu_name: name,
        icon: icon,
        has_sub_menu: hasSubMunus,
        url_route: route,
        menu_id: parentMenu,
        status: status,
        is_deletable: priorityLevel == "permanent" ? 0 : 1,
      };

      const hasChange = changeDetector(isSubMenuExists, changes);

      if (!hasChange) {
        return socket.emit(currentRoute, {
          ...apiResponse.success(true, customMessage.noChange, currentRoute),
        });
      }

      const [updateResult] = await SubMenuModel.update(changes, {
        where: { id: subMenuId },
      });

      if (!updateResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.updErr + "sub menu"),
        });
      }

      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "sub menu" + customMessage.updSucc,
          currentRoute
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },

  // get  sub menu by id
  async getSubMenuById(data, socket, io, currentRoute) {
    try {
      const { subMenuId = false } = data;
      if (!subMenuId || subMenuId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      //   fetch sub-menu by id
      let subMenuResult = await SubMenuModel.findOne({
        where: {
          id: subMenuId,
          //   status: true,
        },
      });

      if (!subMenuResult) {
        return socket.emit("error", {
          ...apiResponse.error(
            false,
            customMessage.notEx,
            currentRoute,
            "Submenu not found"
          ),
        });
      }

      subMenuResult = jsonFormator(subMenuResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "Submenu fetched successfully",
          currentRoute
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },

  async deleteSubMenu(data, socket, io, currentRoute) {
    try {
      const { subMenuId = false } = data;
      if (!subMenuId) {
        return socket.emit("error", {
          ...apiResponse.error(
            false,
            customMessage.badReq,
            currentRoute,
            "Submenu id is required"
          ),
        });
      }

      // check if sub menu exists
      let isSubMenuExists = await SubMenuModel.findOne({
        where: { id: subMenuId },
      });

      if (!isSubMenuExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.notEx),
        });
      }

      if (!isSubMenuExists.is_deletable) {
        socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.cantDel, currentRoute),
        });
      }

      const [deleteResult] = await SubMenuModel.update(
        {
          status: false,
        },
        {
          where: { id: subMenuId },
        }
      );

      if (!deleteResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.delErr, currentRoute),
        });
      }

      socket.emit(currentRoute, {
        ...apiResponse.error(false, customMessage.delSucc, currentRoute),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },

  // *********************************************************** sub sub menu CRUD operation *********************

  async getAllSubSubMenus(data, socket, io, currentRoute) {
    try {
      let allSubSubMenusResult = await SubSubMenuModel.findAll({
        where: {
          status: true,
        },
      });
      allSubSubMenusResult = jsonFormator(allSubSubMenusResult);

      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "All sub sub menus fetched successfully",
          currentRoute,
          allSubSubMenusResult
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },

  //   create new sub sub menu
  async createSubSubMenu(data, socket, io, currentRoute) {
    try {
      const subSubMenuSchema = Yup.object({
        name: Yup.string("invalid  sub-sub menu name").required(
          "plese enter  menu name "
        ),
        parentMenu: Yup.number("invalid sub-menu selected").required(
          "please select a sub menu "
        ),
        grandParentMenu: Yup.number("invalid  menu selected").required(
          "please select a menu  "
        ),
        icon: Yup.string("invalid icon").required("icon is required"),
        route: Yup.string("route/path is required ").required(
          "please enter a route / path"
        ),
        hasSubMunus: Yup.boolean("all fields are required").default(false),
      });

      const validationResult = await subSubMenuSchema.validate(data, {
        abortEarly: true,
        stripUnknown: true,
      });
      const { name, icon, parentMenu, grandParentMenu, hasSubMunus, route } =
        validationResult;

      const isSubSUbMenuExists = await SubSubMenuModel.findOne({
        where: {
          menu_name: name,
          icon: icon,
          url_route: route,
          menu_id: grandParentMenu,
          sub_menu_id: parentMenu,
        },
      });

      if (isSubSUbMenuExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Sub-Sub Menu already exists",
            currentRoute,
            ""
          ),
        });
      }

      const serialNo = await SubMenuModel.max("serial_no");

      let newSubSubMenuResult = await SubMenuModel.create({
        menu_name: name,
        icon: icon,
        serial_no: serialNo + 1,
        menu_id: grandParentMenu,
        sub_menu_id: parentMenu,
        has_sub_menu: hasSubMunus,
        url_route: route,
        created_by: socket.user.id,
      });

      newSubSubMenuResult = jsonFormator(newSubSubMenuResult);
      // if any error while creating menu
      if (!newSubSubMenuResult) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(
            false,
            "Error while creating sub-sub menu",
            currentRoute,
            ""
          ),
        });
      }
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          `Sub-sub Menu  '${name} ' created successfully !`,
          currentRoute,
          newSubSubMenuResult
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },

  // update  sub-sub menu
  async updateSubSubMenu(data, socket, io, currentRoute) {
    try {
      const subSubMenuSchema = Yup.object({
        subSubMenuId: Yup.number()
          .typeError(customMessage.badReq)
          .min(1, customMessage.badReq)
          .required(customMessage.badReq),
        name: Yup.string("invalid  sub-sub menu name").required(
          "plese enter  menu name "
        ),
        parentMenu: Yup.number("invalid sub-menu selected").required(
          "please select a sub menu "
        ),
        grandParentMenu: Yup.number("invalid  menu selected").required(
          "please select a menu  "
        ),
        icon: Yup.string("invalid icon").required("icon is required"),
        route: Yup.string("route/path is required ").required(
          "please enter a route / path"
        ),
        hasSubMunus: Yup.boolean("all fields are required").default(false),
      });
      const {
        subSubMenuId,
        name,
        icon,
        route,
        hasSubMunus,
        status,
        priorityLevel,
      } = await subSubMenuSchema.validate(data);

      // find menu if exists
      let isExists = await SubSubMenuModel.findOne({
        attributes: {
          exclude: [
            "created_by",
            "created_on",
            "updated_by",
            "updated_on",
            "serial_no",
          ],
        },
        where: {
          id: subSubMenuId,
        },
      });
      if (!isExists) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, customMessage.notEx),
        });
      }

      // TODO: upldate sub-sub menu logic here ............
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return socket.emit(currentRoute, {
          ...apiResponse.error(false, error.message, currentRoute, error),
        });
      }
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },

  // delete sub sub menu
  async deleteSubSubMenu(data, socket, io, currentRoute) {
    try {
      const { subSubMenuId = false } = data;
      if (!subSubMenuId || subSubMenuId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }

      //   TODO: delete sub-sub menu logic here .........
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },

  //   get sub-sub Menu By Id
  async getSubSubMenuById(data, socket, io, currentRoute) {
    try {
      const { subSubMenuId = false } = data;
      if (!subSubMenuId || subSubMenuId < 1) {
        return socket.emit("error", {
          ...apiResponse.error(false, customMessage.badReq, currentRoute),
        });
      }
      //   fetch sub-menu by id
      let subSubMenuResult = await SubSubMenuModel.findOne({
        where: {
          id: subSubMenuId,
          status: true,
        },
      });

      if (!subSubMenuResult) {
        return socket.emit("error", {
          ...apiResponse.error(
            false,
            "Submenu not found",
            currentRoute,
            "Submenu not found"
          ),
        });
      }

      subSubMenuResult = jsonFormator(subSubMenuResult);
      socket.emit(currentRoute, {
        ...apiResponse.success(
          true,
          "sub-sub menu fetched successfully",
          currentRoute,
          subSubMenuResult
        ),
      });
    } catch (error) {
      socket.emit("error", {
        ...apiResponse.error(false, error.message, currentRoute, error),
      });
    }
  },
};

export default menuControllers;
