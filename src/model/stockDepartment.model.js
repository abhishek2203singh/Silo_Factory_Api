import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
// import Sequelize from "sequelize";

const StockDepartmentModel = sequelize.define(
    "Stock_Department",
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
        },
        dist_center_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        this_table_ref_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: `This will be used when user will send stock to the requested department on the behalf of table id which have entry_type_id=2 (request). 
                      Example: Pasteurization_Department sent a request for 500 liters of milk, stored with id 18. Now, the user wants to send the 500 stock to the Pasteurization_Department. 
                      The upcoming id of entry will be 19, and the 18 will be stored in this field.`
        },
        approval_status_by_destination: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: true,
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
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "name of destination department where we are sending this entry",
        },
        departmenthead_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "head of destination department",
        },

        distributed_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
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
            type: DataTypes.TEXT("long"),
            allowNull: false,
            comment: "Send Entry Table Name",
        },
        db_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approval_status_id: {
            type: DataTypes.STRING(45),
            allowNull: false,
            defaultValue: "1",
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
        ref_table_id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        approval_datetime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal("NOW()"),
        },

        bill_image: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        selling_price: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        admin_table_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        approval_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        tableName: "Stock_Department",
        timestamps: false,
        // indexes: [
        //   {
        //     name: "entry_type_id_idx",
        //     fields: ["entry_type_id"],
        //   },
        // ],
    }
);

export { StockDepartmentModel };
