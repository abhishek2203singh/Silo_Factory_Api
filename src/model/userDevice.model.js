import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

sequelize; // Adjust the path to your database configuration

const UserDeviceModel = sequelize.define(
  "UserDevice",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user", // name of the table referenced in foreign key
        key: "id", // key in the referenced table
      },
    },
    Device_TypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Master_DeviceType", // name of the table referenced in foreign key
        key: "Id", // key in the referenced table
      },
    },
    device_token: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    imei: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_on: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "user_device",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  }
);

export { UserDeviceModel };
