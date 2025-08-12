import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const MasterState = sequelize.define(
  "MasterState",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_deletable: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false,
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "Master_state",
    timestamps: false, // Disables automatic timestamp fields (createdAt, updatedAt)
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  }
);

export { MasterState };
