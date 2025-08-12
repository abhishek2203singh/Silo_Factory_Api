import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import Sequelize from "sequelize";
const StockInfoModel = sequelize.define(
    "Stock_Info",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        dpt_table_ref_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },
        hold_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0
        },
        master_stock_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        packing_process_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        trns_type: {
            type: DataTypes.STRING(10),
            allowNull: false,
            comment: "IN/OUT",
        },
        master_packing_size_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        weight_per_unit: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },
        product_type: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        price_per_unit: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },
        total_price: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        trans_remark: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        previous_stock: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: true,
        },
        current_stock: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: true,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        distribution_center_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        retail_shop_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "Stock_Info",
        timestamps: false,
    }
);

export { StockInfoModel };
