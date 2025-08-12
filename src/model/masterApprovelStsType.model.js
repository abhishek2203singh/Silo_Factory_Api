import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const MasterApprovalStatusTypeModel = sequelize.define(
  "Master_ApprovalStatus",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
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
    is_deletable: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "Master_ApprovalStatus",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  }
);

export { MasterApprovalStatusTypeModel };
