import { DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";

const MasterEntryTypeModel = sequelize.define(
  "MasterEntryType",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_delete: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "Master_Entry_Type",
    timestamps: false, // Disable automatic timestamps as not present in the schema
  }
);

export { MasterEntryTypeModel };
