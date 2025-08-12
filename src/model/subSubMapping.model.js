import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"; // adjust the path to your database configuration

const SubSubMappingModel = sequelize.define(
  "UserSubSubMenuMapping",
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
        model: "User", // Reference to the 'User' model
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    menu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Menu", // Reference to the 'Menu' model
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    submenu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Sub_Menu", // Reference to the 'Sub_Menu' model
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    subsubmenu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "SubSub_Menu", // Reference to the 'SubSub_Menu' model
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
        model: "User", // Reference to the 'User' model
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
        model: "User", // Reference to the 'User' model
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
    tableName: "User_SubSubMenu_Maping", // The name of the table in the database
    timestamps: false,
  }
);

export { SubSubMappingModel };
