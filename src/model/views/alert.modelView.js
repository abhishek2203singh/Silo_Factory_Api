import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const InfoAlert = sequelize.define(
  "VkAlert",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    alert_type: {
      type: DataTypes.INTEGER,
    },
    message_title: {
      type: DataTypes.STRING,
    },
    message: {
      type: DataTypes.TEXT,
    },
    ViewStatus: {
      type: DataTypes.BOOLEAN,
    },
    created_by: {
      type: DataTypes.INTEGER,
    },
    created_on: {
      type: DataTypes.DATE,
    },
    updated_by: {
      type: DataTypes.INTEGER,
    },
    updated_on: {
      type: DataTypes.DATE,
    },
    full_name: {
      type: DataTypes.STRING,
    },
    profile_photo: {
      type: DataTypes.STRING,
    },
    massage_sender_id: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
    },
    department_name: {
      type: DataTypes.STRING,
    },
    role_name: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "Vk_Alert",
    timestamps: false,
    freezeTableName: true,
  }
);

export { InfoAlert };
