import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"; // Adjust the path to your database configuration

const SubSubMenuUserSubSubMenuMapping = sequelize.define(
    "Vk_SubSubMenu_UserSubSubMenuMapping",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        menu_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        url_route: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        serial_no: {
            type: DataTypes.INTEGER,
        },
        parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        mapping_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        subsubmenu_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: true,
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
        tableName: "Vk_SubSubMenu_UserSubSubMenuMapping",
        timestamps: false, // Since views don't have createdAt/updatedAt columns
    }
);

export { SubSubMenuUserSubSubMenuMapping };
