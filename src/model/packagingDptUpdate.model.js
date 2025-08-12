import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import Sequelize from "sequelize";
const PackagingDptUpdateModel = sequelize.define(
    "Packaging_Department_Update",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        ref_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Packaging_Department",
                key: "id",
            },
        }, this_table_ref_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: `This will be used when user will send stock to the requested department on the behalf of table id which have entry_type_id=2 (request). 
                      Example: Pasteurization_Department sent a request for 500 liters of milk, stored with id 18. Now, the user wants to send the 500 stock to the Pasteurization_Department. 
                      The upcoming id of entry will be 19, and the 18 will be stored in this field.`
        },
        entry_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        ms_product_type_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        master_packing_size_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        departmenthead_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approval_status_by_destination: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        activity: {
            type: DataTypes.STRING(45),
            allowNull: true,
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
        db_table_name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        db_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approval_by: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            defaultValue: 0,
        },
        approval_status_id: {
            type: DataTypes.STRING(45),
            allowNull: false,
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
        tableName: "Packaging_Department_Update",
        timestamps: false, // Disable default timestamps
        indexes: [
            {
                name: "Packaging_Department_Update",
                fields: ["ref_table_id"],
            },
        ],
    }
);

export { PackagingDptUpdateModel };
