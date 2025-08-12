import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const MasterProductTypeModel = sequelize.define(
  "Master_Product_Type",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT,
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
    updated_on: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Master_Product_Type",
    timestamps: false,
  }
);

export { MasterProductTypeModel };
