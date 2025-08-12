import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"; // adjust the path to your database configuration
import { MenuModel } from "./menu.model.js";

const MenuMappingModel = sequelize.define(
  "UserMenuMapping",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User", // Adjust according to your User model name
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    menu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Menu", // Adjust according to your Menu model name
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User", // Adjust according to your User model name
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "User", // Adjust according to your User model name
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    updated_on: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "User_Menu_Maping",
    timestamps: false,
  }
);

MenuMappingModel.belongsTo(MenuModel, { foreignKey: "menu_id" });
MenuModel.hasMany(MenuMappingModel, { foreignKey: "menu_id" });
export { MenuMappingModel };
