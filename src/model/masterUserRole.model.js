import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const MasterUserRole = sequelize.define(
  "MasterUserRole",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING(450),
      allowNull: false,
    },
    is_deletable: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "Master_User_Role",
    timestamps: false, // Disables automatic timestamp fields (createdAt, updatedAt)
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  }
);

export { MasterUserRole };
