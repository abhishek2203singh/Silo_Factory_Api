import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const QualityControlUpdate = sequelize.define(
    "Quality_Control_Update",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ref_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        unit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        priceper_unit: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        departmenthead_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }, db_table_name: {
            type: DataTypes.TEXT,
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
        bill_image: {
            type: DataTypes.TEXT("long"),
            allowNull: true,
        },
        payment_status_to_vendor: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        payment_approve_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        payment_status_by: {
            type: DataTypes.INTEGER,
            allowNull: true,

        },
        payment_id: {
            type: DataTypes.INTEGER,
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
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        activity: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
    },
    {
        tableName: "Quality_Control_Update",
        timestamps: false, // Disable the automatic timestamp fields (createdAt, updatedAt)
    }
);

export { QualityControlUpdate };
