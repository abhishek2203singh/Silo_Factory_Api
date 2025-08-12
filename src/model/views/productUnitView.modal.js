import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const VKProductUnitModal = sequelize.define('VKProductUnit', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ms_product_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  product_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  st_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  unit_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  product_image: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'VK_Product_Packing_Size',
  timestamps: false, // Since it's a view, it doesn't have timestamps
  freezeTableName: true // Ensure that Sequelize doesn't pluralize the table name
});

export { VKProductUnitModal };
