import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
// import { ProductModel } from "./product.model.js";

const MasterStockModel = sequelize.define(
  "Master_Stock",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    available_qty: {
      type: DataTypes.DECIMAL(11, 2),
      defaultValue: 0.00
    },
    hold_quantity: {
      type: DataTypes.DECIMAL(11, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ms_product_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    master_packing_size_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    master_department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Owner of particular stock space'
    },
    retail_shop_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    distribution_center_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_packed_product: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updated_on: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_deletable: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: "Master_Stock", // Explicitly define the table name
    timestamps: false, // Since `created_on` and `updated_on` are manually handled
  }
);
// MasterStockModel.belongsTo(ProductModel, {
//   foreignKey: "product_id",
//   targetKey: "id",
// });

export { MasterStockModel };
