import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const AlertModel = sequelize.define(
  "AlertsModel",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    get_department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    alert_type: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    message_title: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    ViewStatus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    sequelize,
    modelName: "InfoAlert",
    tableName: "Info_Alert",
    timestamps: false, // Disable automatic timestamps if you are handling them manually
  }
);

export { AlertModel };
