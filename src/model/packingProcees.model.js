import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const PackingProcessModel = sequelize.define(
    "Packing_Process",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        packing_material_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_product_packed: {
            type: DataTypes.DECIMAL(11, 2),
            defaultValue: 0,
            allowNull: false,
        },
        packing_material_size_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        packing_material_master_stock_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_master_stock_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        material_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        master_packing_size_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_packings: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        start_time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        created_by: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        is_finished: {
            type: DataTypes.TINYINT,
            defaultValue: 0,
            allowNull: true,

        },
        finish_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_on: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
    },
    {
        tableName: "Packing_Process",
        timestamps: false,
    }
);

export { PackingProcessModel };
