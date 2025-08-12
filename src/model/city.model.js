import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const CityModel = sequelize.define(
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
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Master_cities",
    timestamps: false,
  }
);

export { CityModel };
