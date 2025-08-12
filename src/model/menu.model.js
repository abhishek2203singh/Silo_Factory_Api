import { DataTypes } from "sequelize";
import { UserModel } from "./user.model.js";
import { sequelize } from "../config/dbConfig.js";

const MenuModel = sequelize.define(
    "Menu",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        menu_name: {
            type: DataTypes.STRING(450),
            allowNull: false,
        },
        icon: {
            type: DataTypes.TEXT("long"),
            allowNull: true, // Assuming it's optional based on SQL schema
        },
        serial_no: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_deletable: {
            type: DataTypes.BOOLEAN, // boolean
            allowNull: false,
            defaultValue: false,
        },
        has_sub_menu: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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
        tableName: "Menu",
        timestamps: false,
    }
);

// Define associations
// Menu.associate = models => {
//   Menu.belongsTo(models.User, {
//     foreignKey: 'created_by',
//     as: 'creator', // You can name this association as needed
//   });
// };

MenuModel.belongsTo(UserModel, { foreignKey: "created_by", targetKey: "id" });

export { MenuModel };
