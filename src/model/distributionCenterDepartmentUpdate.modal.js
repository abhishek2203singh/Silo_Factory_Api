import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const DistributionCenterDepartmentUpdateModal = sequelize.define(
    "DistributionCenter_Department_Update",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        ref_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }, this_table_ref_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: `This will be used when user will send stock to the requested department on the behalf of table id which have entry_type_id=2 (request). 
                      Example: Pasteurization_Department sent a request for 500 liters of milk, stored with id 18. Now, the user wants to send the 500 stock to the Pasteurization_Department. 
                      The upcoming id of entry will be 19, and the 18 will be stored in this field.`
        },
        retail_table_ref_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        activity: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        message_val: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        entry_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
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
        distributed_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        priceper_unit: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "destination department where we are sending this entry",
        },
        departmenthead_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        dist_center_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approval_status_by_destination: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        unit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        db_table_name: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "Send Entry Table Name",
        },
        db_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approval_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        admin_table_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        approval_status_id: {
            type: DataTypes.STRING(45),
            allowNull: false,
            defaultValue: "1",
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
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        with_approval: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
        bill_image: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        ms_product_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        master_packing_size_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
    },
    {
        tableName: "DistributionCenter_Department_Update",
        timestamps: false, // Disable default createdAt/updatedAt columns
    }
);

export { DistributionCenterDepartmentUpdateModal };
