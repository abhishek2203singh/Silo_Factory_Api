import { DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js"; // Adjust the path to your database configuration

const MasterDeviceType = sequelize.define(
  "MasterDeviceType",
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    is_deletable: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false,
    }, created_on: {
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
    tableName: "Master_DeviceType",
    timestamps: false, // Disables automatic timestamp fields (createdAt, updatedAt)
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  }
);

export default MasterDeviceType;
