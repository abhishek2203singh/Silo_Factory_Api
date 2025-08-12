import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import Sequelize from "sequelize";
const EcommerceDepartmentModel = sequelize.define(
    "Ecommerce_Department",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        ecommerce_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        entry_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        master_packing_size_id: {
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
        quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        rejected_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        unit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        weight_per_unit: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        priceper_unit: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        with_approval: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        approval_by: {
            type: DataTypes.INTEGER,
            allowNull: true, // Since DEFAULT NULL was specified
        },
        self_approval_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        self_approval_status_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        destination_approval_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        approval_status_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        db_table_name: {
            type: DataTypes.TEXT("long"),
            allowNull: false,
        },
        db_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approval_datetime: {
            type: DataTypes.DATE,
            allowNull: true, // Since DEFAULT NULL was specified
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true, // Since DEFAULT NULL was specified
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true, // Since DEFAULT NULL was specified
        },
    },
    {
        tableName: "Ecommerce_Department", // Replace with your actual table name
        timestamps: false, // If you don't want Sequelize to automatically handle createdAt/updatedAt
    }
);

export { EcommerceDepartmentModel };
