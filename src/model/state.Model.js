import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const StateModel = sequelize.define(
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
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "Master_state",
    timestamps: false,
  }
);

export { StateModel };
