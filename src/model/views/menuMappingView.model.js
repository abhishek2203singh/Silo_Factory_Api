import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js"; // Adjust the path to your database configuration

const MenuUserMenuMappingView = sequelize.define(
    "Vk_Menu_UserMenuMapping",
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

        has_sub_menu: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        serial_no: {
            type: DataTypes.INTEGER,
        },
        icon: {
            type: DataTypes.TEXT,
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
        menu_id: {
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
        tableName: "Vk_Menu_UserMenuMapping",
        timestamps: false,
    }
);

export { MenuUserMenuMappingView };
