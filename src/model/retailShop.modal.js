import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import Sequelize from "sequelize";
const RetailShopDepartmentModal = sequelize.define('RetailShop_Department', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  retail_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  entry_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ms_product_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message_val: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  master_packing_size_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(11, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  distributed_quantity: {
    type: DataTypes.DECIMAL(10, 0),
    defaultValue: 0,
  },
  bill_image: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  weight_per_unit: {
    type: DataTypes.DECIMAL(11, 2),
    allowNull: false,
  },
  priceper_unit: {
    type: DataTypes.DECIMAL(11, 2),
    allowNull: false,
  },
  self_approval_datetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  distribution_center_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  approval_status_by_destination: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  self_approval_status_id: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  destination_approval_datetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_on: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  updated_on: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  }
}, {
  tableName: 'RetailShop_Department',
  timestamps: false,
  underscored: true,  // Optional: if you prefer snake_case column names in the DB
});

export { RetailShopDepartmentModal };
