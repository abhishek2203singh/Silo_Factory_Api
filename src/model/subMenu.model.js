import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"; // Adjust the path if necessary

import { MenuModel } from "./menu.model.js"; // Adjust import path according to your project structure
import { UserModel } from "./user.model.js"; // Adjust import path according to your project structure

const SubMenuModel = sequelize.define(
    "SubMenu",
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
        has_sub_menu: {
            type: DataTypes.TINYINT,
            defaultValue: false,
            allowNull: false,
        },
    },
    {
        tableName: "Sub_Menu",
        timestamps: false, // Disables automatic timestamp fields (createdAt, updatedAt)
        charset: "utf8mb4",
        collate: "utf8mb4_0900_ai_ci",
    }
);

// Define relationships
SubMenuModel.belongsTo(MenuModel, {
    foreignKey: "menu_id",
    targetKey: "id",
    as: "menu",
});
SubMenuModel.belongsTo(UserModel, {
    foreignKey: "created_by",
    targetKey: "id",
});

export { SubMenuModel };
