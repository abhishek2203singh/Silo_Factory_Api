import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const MasterApprovalStatusModel = sequelize.define(
  "Master_ApprovalStatus",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.TEXT, // longtext corresponds to Sequelize.TEXT
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    is_deletable: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
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
    tableName: "Master_ApprovalStatus",
    timestamps: false, // Disable timestamps if not present in the table
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  }
);

export { MasterApprovalStatusModel };
