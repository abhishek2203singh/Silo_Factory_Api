import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"; // Adjust the path if necessary

import { MenuModel } from "./menu.model.js"; // Adjust import path according to your project structure
import { SubMenuModel } from "./subMenu.model.js"; // Adjust import path according to your project structure
import { UserModel } from "./user.model.js"; // Adjust import path according to your project structure

const SubSubMenuModel = sequelize.define(
    "SubSubMenu",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        menu_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        sub_menu_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        menu_name: {
            type: DataTypes.STRING(450),
            allowNull: false,
        },
        icon: {
            type: DataTypes.TEXT("long"),
            allowNull: true,
        },
        serial_no: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        url_route: {
            type: DataTypes.TEXT("long"),
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_on: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "SubSub_Menu",
        timestamps: false, // Disables automatic timestamp fields (createdAt, updatedAt)
        charset: "utf8mb4",
        collate: "utf8mb4_0900_ai_ci",
    }
);

// Define relationships
SubSubMenuModel.belongsTo(MenuModel, {
    foreignKey: "menu_id",
    targetKey: "id",
    as: "menu",
});
SubSubMenuModel.belongsTo(SubMenuModel, {
    foreignKey: "sub_menu_id",
    targetKey: "id",
    as: "subMenu",
});
SubSubMenuModel.belongsTo(UserModel, {
    foreignKey: "created_by",
    targetKey: "id",
    as: "creator",
});

export { SubSubMenuModel };
