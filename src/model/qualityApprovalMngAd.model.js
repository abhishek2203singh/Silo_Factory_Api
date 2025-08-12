import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import Sequelize from "sequelize";
const QualityApprovalManagerWithAdmin = sequelize.define(
    "Quality_approval_manager_With_admin",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        master_packing_size_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approval_status_by_destination: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },

        rejected_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        priceper_unit: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: "0.00",
        },
        unit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        db_table_name: {
            type: DataTypes.TEXT("long"),
            allowNull: false,
        },

        db_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        admin_table_ref_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        entry_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        in_departmenthead_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        dist_center_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        in_department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        send_db_table_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        send_departmenthead_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        send_department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approval_status_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        approval_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        approval_datetime: {
            type: DataTypes.DATE,
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
        created_on: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "Quality_approval_manager_With_admin",
        timestamps: false, // Assuming you don't want Sequelize to handle createdAt and updatedAt
        charset: "utf8mb4",
        collate: "utf8mb4_0900_ai_ci",
    }
);

export { QualityApprovalManagerWithAdmin };
