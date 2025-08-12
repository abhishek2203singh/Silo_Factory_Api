import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const StockInfoViewModel = sequelize.define('VK_Stock_Info', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    master_stock_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    packed_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    product_unit: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    weight: {
        type: DataTypes.STRING, // Weight can be 'N/A', which is a string
        allowNull: true,
    },
    packing_unit: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    packing_sort_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    product_st_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    department_table_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    department_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    trns_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    trans_remark: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dpt_table_ref_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    distribution_center_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    retail_shop_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    hold_quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    current_stock: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    previous_stock: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    mrp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    shop_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    distribution_center_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: true,
    },

},
    {
        // Model options
        tableName: 'VK_Stock_Info',  // This should be the name of the view
        timestamps: false,  // No timestamps for views
        freezeTableName: true,  // Ensures Sequelize doesn't pluralize the table name
        createdAt: false,
        updatedAt: false,
        deletedAt: false
    });

export { StockInfoViewModel };
