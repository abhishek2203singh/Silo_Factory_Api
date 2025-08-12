import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
const productDptModel = sequelize.define("ProductDptModel", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
});

export default productDptModel;
