import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"; // adjust the path to your database configuration
import { SubMenuModel } from "./subMenu.model.js";

const SubMapingModel = sequelize.define(
  "UserSubMenuMapping",
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
    submenu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Sub_Menu", // Adjust according to your Sub_Menu model name
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
    tableName: "User_SubMenu_Maping",
    timestamps: false,
  }
);

SubMapingModel.belongsTo(SubMenuModel, { foreignKey: "submenu_id" });
SubMenuModel.hasMany(SubMapingModel, { foreignKey: "submenu_id" });

export { SubMapingModel };
