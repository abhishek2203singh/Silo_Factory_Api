import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const OthereDepartmentUpdateModel = sequelize.define(
    "Other_Department_Update",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        entry_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        }, this_table_ref_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: `This will be used when user will send stock to the requested department on the behalf of table id which have entry_type_id=2 (request). 
                      Example: Pasteurization_Department sent a request for 500 liters of milk, stored with id 18. Now, the user wants to send the 500 stock to the Pasteurization_Department. 
                      The upcoming id of entry will be 19, and the 18 will be stored in this field.`
        },
        activity: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        ref_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approval_status_by_destination: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
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
        approval_by: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
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
        db_table_name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        db_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        priceper_unit: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: true,
            defaultValue: 0.0,
        },
        with_approval: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
        departmenthead_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
            allowNull: true,
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        approval_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        bill_image: {
            type: DataTypes.TEXT,
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
            allowNull: false,
            defaultValue: 0,
        },
        payment_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "Other_Department_Update",
        timestamps: false,
        underscored: true,
        charset: "utf8mb4",
        collate: "utf8mb4_0900_ai_ci",
    }
);

export { OthereDepartmentUpdateModel };
