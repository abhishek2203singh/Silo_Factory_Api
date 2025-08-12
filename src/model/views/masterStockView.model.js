
import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const MasterStockViewModel = sequelize.define('VK_Master_Stock', {
    master_stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    hold_quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    quantity_can_be_used: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    ms_product_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    available_qty: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    stock_st_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    unit_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    stock_uom: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    st_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    packing_size_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    product_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    retail_shop_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    distribution_center_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    is_packed_product: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },

}, {
    // Model options
    tableName: 'VK_Master_Stock',
    timestamps: false, // No timestamps for views
    underscored: true, // If your database uses snake_case for column names
    createdAt: false,
    updatedAt: false,
    deletedAt: false,
    freezeTableName: true,
});

// Export the model
export { MasterStockViewModel };
