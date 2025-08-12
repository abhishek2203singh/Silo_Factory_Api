import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const MasterCities = sequelize.define(
  "MasterCities",
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
    is_deletable: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Master_state", // Reference to the Master_state table
        key: "id", // Key in the referenced table
      },
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
    tableName: "Master_cities",
    timestamps: false, // Disables automatic timestamp fields (createdAt, updatedAt)
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  }
);

export { MasterCities };
